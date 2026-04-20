"""
Web Researcher Agent
=====================
Scrapes/searches the internet for hotel data from credible sources.

Two modes:
  - URL provided   -> scrape that page directly
  - Hotel name     -> search DuckDuckGo, scrape top results

Returns raw text content + list of source URLs.
"""

import os
import re
from ddgs import DDGS
from firecrawl import FirecrawlApp
from src.state import AEOState


# Max characters to extract per page (to avoid token overflow when sent to LLM)
MAX_CONTENT_LENGTH = 10000 # Increased since markdown is denser


def is_url(text: str) -> bool:
    """Check if the input looks like a URL."""
    return bool(re.match(r"https?://", text.strip()))


def scrape_url(url: str) -> str:
    """
    Scrape a single URL using Firecrawl and return markdown content.
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("   [Error] FIRECRAWL_API_KEY is not set in .env")
        return f"[Failed to scrape {url}: Missing FIRECRAWL_API_KEY]"
    
    try:
        app = FirecrawlApp(api_key=api_key)
        # In firecrawl-py 1.0+, it's .scrape and returns a Document object
        doc = app.scrape(url, formats=['markdown'])
        
        # Extract markdown from Document object
        content = getattr(doc, 'markdown', "")
        if not content:
            content = str(doc)
            
        # Clean up excessive newlines
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Truncate to avoid sending too much to the LLM
        return content[:MAX_CONTENT_LENGTH]
        
    except Exception as e:
        return f"[Failed to scrape {url}: {e}]"


def search_and_scrape(hotel_name: str) -> tuple[list[dict], list[str]]:
    """
    Search DuckDuckGo for hotel information, then scrape top results.
    Prioritizes credible travel/booking sources.
    
    Returns:
        (scraped_pages, source_urls)
    """
    # Domains to skip (social media, forums, etc.)
    skip_domains = {"reddit.com", "facebook.com", "twitter.com", "instagram.com", "tiktok.com"}
    
    # Targeted search queries for credible hotel sources
    search_queries = [
        f"{hotel_name} site:tripadvisor.com OR site:booking.com",
        f"{hotel_name} hotel official site amenities rooms",
        f"{hotel_name} hotel reviews rating location",
    ]
    
    all_results = []
    seen_urls = set()
    
    for query in search_queries:
        try:
            results = DDGS().text(query, max_results=4)
            for r in results:
                url = r.get("href", "")
                # Skip unwanted domains
                if any(domain in url for domain in skip_domains):
                    continue
                if url and url not in seen_urls:
                    seen_urls.add(url)
                    all_results.append(r)
        except Exception as e:
            print(f"   [Warning] Search failed for '{query}': {e}")
    
    # Scrape the top results (limit to 4 to get good coverage)
    scraped_pages = []
    source_urls = []
    
    for result in all_results[:4]:
        url = result.get("href", "")
        title = result.get("title", "")
        snippet = result.get("body", "")
        
        print(f"   Scraping: {title[:60]}...")
        content = scrape_url(url)
        
        # Skip if scraping failed
        if content.startswith("[Failed"):
            print(f"   [Skipped] Could not scrape: {url[:60]}")
            print(f"   Reason: {content}")
            continue
        
        scraped_pages.append({
            "url": url,
            "title": title,
            "snippet": snippet,
            "content": content,
        })
        source_urls.append(url)
    
    return scraped_pages, source_urls


def web_researcher(state: AEOState) -> dict:
    """
    Web Researcher Agent node for LangGraph.
    
    Determines whether input is a URL or hotel name, then:
      - URL: scrapes it directly
      - Name: searches the web and scrapes top results
    """
    hotel_input = state.get("hotel_name_or_url", "").strip()
    
    print(f"\n>> [Web Researcher] Researching: {hotel_input}")
    
    if not hotel_input:
        print("   [Error] No hotel name or URL provided")
        return {
            "raw_hotel_data": {"error": "No input provided"},
            "sources": [],
        }
    
    if is_url(hotel_input):
        # ── Direct URL scraping ──
        print(f"   Mode: Direct URL scraping")
        content = scrape_url(hotel_input)
        
        return {
            "raw_hotel_data": {
                "source_type": "direct_url",
                "url": hotel_input,
                "content": content,
            },
            "sources": [hotel_input],
        }
    else:
        # ── Search by hotel name ──
        print(f"   Mode: Web search + scraping")
        scraped_pages, source_urls = search_and_scrape(hotel_input)
        
        if not scraped_pages:
            print("   [Warning] No results found, using search snippets only")
        
        print(f"   Found {len(scraped_pages)} sources")
        
        return {
            "raw_hotel_data": {
                "source_type": "search",
                "hotel_query": hotel_input,
                "pages": scraped_pages,
            },
            "sources": source_urls,
        }
