"""
Web Researcher Agent
=====================
Scrapes a given hotel website using Firecrawl to gather data.

Mode:
  - Takes a specific hotel URL and scrapes it with targeted extraction
  - Crawls key subpages (rooms, dining, facilities) for comprehensive data
  - Falls back to Tavily search if crawling fails

Returns raw text content + list of crawled source URLs.
"""

import os
import re
from firecrawl import FirecrawlApp
from tavily import TavilyClient
from src.state import AEOState


# Max characters to extract per page (to avoid token overflow when sent to LLM)
MAX_CONTENT_LENGTH = 15000

# Hotel subpage patterns to crawl for comprehensive data
HOTEL_SUBPAGES = [
    "/rooms", "/room", "/accommodation", "/accommodations", "/suites",
    "/dining", "/restaurants", "/food-and-drink", "/eat-and-drink",
    "/facilities", "/amenities", "/services", "/spa", "/wellness",
    "/offers", "/packages", "/deals",
    "/about", "/about-us",
    "/gallery", "/photos",
]

# JSON schema for Firecrawl's structured extraction
HOTEL_EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "hotel_name": {"type": "string"},
        "location": {"type": "string"},
        "star_rating": {"type": "string"},
        "description": {"type": "string"},
        "amenities": {"type": "array", "items": {"type": "string"}},
        "room_types": {"type": "array", "items": {"type": "string"}},
        "dining_options": {"type": "array", "items": {"type": "string"}},
        "price_range": {"type": "string"},
        "review_summary": {"type": "string"},
        "unique_selling_points": {"type": "array", "items": {"type": "string"}},
        "nearby_attractions": {"type": "array", "items": {"type": "string"}},
        "contact_info": {"type": "string"},
    },
}

HOTEL_EXTRACT_PROMPT = (
    "Extract ALL hotel information from this page: hotel name, full address/location, "
    "star rating, a description of the hotel, a complete list of ALL amenities and "
    "facilities (pool, spa, gym, wifi, parking, business center, etc.), ALL room types "
    "with brief descriptions, ALL dining options/restaurants/bars, price range per night, "
    "guest review summary, unique selling points, nearby attractions, and contact "
    "information (phone, email, website). Be extremely thorough — extract every single "
    "amenity, room type, and dining option mentioned on the page."
)


def scrape_main_page(app: FirecrawlApp, url: str) -> tuple[list[dict], list[str], dict]:
    """
    Scrape the main hotel URL with both markdown and structured extraction.
    Returns (pages, source_urls, extracted_data).
    """
    scraped_pages = []
    source_urls = []
    extracted_data = {}

    try:
        print(f"   [Firecrawl] Scraping main page: {url}")
        result = app.scrape_url(
            url,
            params={
                'formats': ['markdown', 'extract'],
                'extract': {
                    'prompt': HOTEL_EXTRACT_PROMPT,
                    'schema': HOTEL_EXTRACT_SCHEMA,
                }
            }
        )

        if result:
            # Get markdown content
            markdown = ""
            if isinstance(result, dict):
                markdown = result.get('markdown', '') or ''
                extracted_data = result.get('extract', {}) or {}
                metadata = result.get('metadata', {}) or {}
            else:
                markdown = getattr(result, 'markdown', '') or ''
                extracted_data = getattr(result, 'extract', {}) or {}
                metadata = getattr(result, 'metadata', {}) or {}

            title = metadata.get('title', url) if isinstance(metadata, dict) else getattr(metadata, 'title', url)
            if title is None:
                title = url

            markdown = str(markdown)
            markdown = re.sub(r'\n{3,}', '\n\n', markdown)
            markdown = markdown[:MAX_CONTENT_LENGTH]

            scraped_pages.append({
                "url": url,
                "title": str(title),
                "snippet": f"Main page content from {title}",
                "content": markdown,
            })
            source_urls.append(url)
            print(f"   Scraped main: {str(title)[:60]}...")

            if extracted_data:
                print(f"   Extracted structured data: {len(extracted_data)} fields")
    except Exception as e:
        print(f"   [Warning] Main page scrape failed: {e}")

    return scraped_pages, source_urls, extracted_data


def crawl_subpages(app: FirecrawlApp, base_url: str) -> tuple[list[dict], list[str]]:
    """
    Scrape common hotel subpages for rooms, dining, facilities data.
    """
    scraped_pages = []
    source_urls = []
    base = base_url.rstrip('/')

    print(f"   [Firecrawl] Crawling subpages for additional hotel data...")
    subpages_found = 0

    for subpage in HOTEL_SUBPAGES:
        if subpages_found >= 5:
            break  # Limit to 5 successful subpages to control token budget

        sub_url = base + subpage
        try:
            result = app.scrape_url(sub_url, params={'formats': ['markdown']})

            if result:
                markdown = ""
                metadata = {}
                if isinstance(result, dict):
                    markdown = result.get('markdown', '') or ''
                    metadata = result.get('metadata', {}) or {}
                else:
                    markdown = getattr(result, 'markdown', '') or ''
                    metadata = getattr(result, 'metadata', {}) or {}

                # Skip if page returned very little content (likely a 404 or redirect)
                if len(str(markdown)) < 200:
                    continue

                title = metadata.get('title', sub_url) if isinstance(metadata, dict) else getattr(metadata, 'title', sub_url)
                if title is None:
                    title = sub_url

                markdown = str(markdown)
                markdown = re.sub(r'\n{3,}', '\n\n', markdown)
                markdown = markdown[:MAX_CONTENT_LENGTH]

                scraped_pages.append({
                    "url": sub_url,
                    "title": str(title),
                    "snippet": f"Subpage content: {subpage}",
                    "content": markdown,
                })
                source_urls.append(sub_url)
                subpages_found += 1
                print(f"   Subpage found: {subpage} → {str(title)[:50]}...")
        except Exception:
            # Subpage doesn't exist, skip silently
            continue

    print(f"   Found {subpages_found} additional subpages")
    return scraped_pages, source_urls


def crawl_hotel_site(url: str) -> tuple[list[dict], list[str], dict]:
    """
    Scrape a hotel URL using Firecrawl with targeted extraction + subpage crawling.
    Returns (scraped_pages, source_urls, extracted_data).
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("   [Error] FIRECRAWL_API_KEY is not set in .env")
        return [{"url": url, "title": "Error", "snippet": "", "content": f"[Failed to crawl: Missing FIRECRAWL_API_KEY]"}], [], {}

    try:
        app = FirecrawlApp(api_key=api_key)

        # Step 1: Scrape main page with structured extraction
        main_pages, main_urls, extracted_data = scrape_main_page(app, url)

        # Step 2: Crawl subpages for rooms, dining, facilities
        sub_pages, sub_urls = crawl_subpages(app, url)

        all_pages = main_pages + sub_pages
        all_urls = main_urls + sub_urls

        return all_pages, all_urls, extracted_data

    except Exception as e:
        print(f"   [Error] Failed to crawl {url}: {e}")
        return [], [], {}


def search_hotel_info(url: str) -> tuple[list[dict], list[str]]:
    """
    Fallback: Use Tavily search to find information about the hotel if crawling fails.
    Performs multiple targeted searches for comprehensive coverage.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return [], []

    try:
        client = TavilyClient(api_key=api_key)
        print(f"   [Fallback] Searching for info about {url} using Tavily...")

        # Multiple targeted searches for better coverage
        queries = [
            f"hotel {url} rooms types prices amenities facilities",
            f"hotel {url} restaurants dining options bars",
            f"hotel {url} reviews rating location address contact",
        ]

        scraped_pages = []
        source_urls = []
        seen_urls = set()

        for query in queries:
            try:
                results = client.search(query=query, search_depth="advanced", max_results=3)
                for res in results.get('results', []):
                    res_url = res.get('url', '')
                    if res_url not in seen_urls:
                        seen_urls.add(res_url)
                        scraped_pages.append({
                            "url": res_url,
                            "title": res.get('title', ''),
                            "snippet": res.get('content', ''),
                            "content": res.get('content', ''),
                        })
                        source_urls.append(res_url)
            except Exception as e:
                print(f"   [Warning] Tavily query failed: {e}")
                continue

        print(f"   [Fallback] Found {len(scraped_pages)} results from Tavily")
        return scraped_pages, source_urls
    except Exception as e:
        print(f"   [Error] Fallback search failed: {e}")
        return [], []


def web_researcher(state: AEOState) -> dict:
    """
    Web Researcher Agent node for LangGraph.

    Scrapes the provided hotel_url using Firecrawl with targeted extraction.
    """
    hotel_url = state.get("hotel_url", "").strip()

    print(f"\n>> [Web Researcher] Researching: {hotel_url}")

    if not hotel_url:
        print("   [Error] No hotel URL provided")
        return {
            "raw_hotel_data": {"error": "No URL provided"},
            "sources": [],
        }

    # ── Crawl the hotel website with targeted extraction ──
    print(f"   Mode: Targeted Scrape + Subpage Crawl")
    scraped_pages, source_urls, extracted_data = crawl_hotel_site(hotel_url)

    # ── Fallback if crawl failed ──
    if not scraped_pages:
        print("   [Warning] Crawl returned no data. Initiating fallback search...")
        scraped_pages, source_urls = search_hotel_info(hotel_url)

    if not scraped_pages:
        print("   [Critical] No data found for this hotel after both crawl and search.")
        # Return a dummy entry so the pipeline doesn't crash
        scraped_pages = [{
            "url": hotel_url,
            "title": "Information Not Found",
            "snippet": "We could not retrieve detailed information from the hotel website.",
            "content": f"The hotel website at {hotel_url} could not be analyzed. Please check the URL or try another hotel."
        }]

    print(f"   Found {len(scraped_pages)} source pages total")

    return {
        "raw_hotel_data": {
            "source_type": "crawl",
            "hotel_url": hotel_url,
            "pages": scraped_pages,
            "extracted_data": extracted_data,  # Pass structured extraction to data_aggregation
        },
        "sources": source_urls,
    }
