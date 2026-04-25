"""
Web Researcher Agent
=====================
Scrapes a given hotel website using Firecrawl to gather data.

Mode:
  - Takes a specific hotel URL and crawls it (up to a small limit of pages)
  - Extracts the markdown content to feed into the LLM

Returns raw text content + list of crawled source URLs.
"""

import os
import re
from firecrawl import FirecrawlApp
from tavily import TavilyClient
from src.state import AEOState


# Max characters to extract per page (to avoid token overflow when sent to LLM)
MAX_CONTENT_LENGTH = 10000 


def crawl_hotel_site(url: str) -> tuple[list[dict], list[str]]:
    """
    Crawl a hotel URL using Firecrawl and return markdown content from multiple pages.
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        print("   [Error] FIRECRAWL_API_KEY is not set in .env")
        return [{"url": url, "title": "Error", "snippet": "", "content": f"[Failed to crawl: Missing FIRECRAWL_API_KEY]"}], []
    
    try:
        app = FirecrawlApp(api_key=api_key)
        
        print(f"   [Firecrawl] Crawling {url} (this may take a minute)...")
        # Crawl the site up to 5 pages to get comprehensive info without exploding token count
        job = app.crawl(
            url, 
            limit=5, 
            scrape_options={'formats': ['markdown']}
        )
        
        scraped_pages = []
        source_urls = []
        
        # Firecrawl SDK can return either a dictionary or an object with a 'data' attribute
        data = []
        if hasattr(job, 'data'):
            data = job.data
        elif isinstance(job, dict):
            data = job.get('data', [])
            
        if data:
            for doc in data:
                if doc is None:
                    continue
                    
                # Handle both Document objects and dictionaries
                if isinstance(doc, dict):
                    metadata = doc.get('metadata') or {}
                    content = doc.get('markdown') or doc.get('content') or ""
                    page_url = metadata.get('source_url') or metadata.get('url') or url
                    title = metadata.get('title') or page_url
                else:
                    metadata = getattr(doc, 'metadata', {}) or {}
                    content = getattr(doc, 'markdown', "") or getattr(doc, 'content', "") or ""
                    if not content:
                        content = str(doc)
                    page_url = getattr(metadata, 'source_url', url) if hasattr(metadata, 'source_url') else url
                    if page_url is None: page_url = url
                    title = getattr(metadata, 'title', page_url) if hasattr(metadata, 'title') else page_url
                    if title is None: title = page_url
                    
                # Ensure they are strings for safety
                content = str(content)
                title = str(title)
                page_url = str(page_url)
                
                # Clean up excessive newlines
                content = re.sub(r'\n{3,}', '\n\n', content)
                
                # Truncate to avoid sending too much to the LLM
                content = content[:MAX_CONTENT_LENGTH]
                
                scraped_pages.append({
                    "url": page_url,
                    "title": title,
                    "snippet": f"Content from {title}",
                    "content": content,
                })
                source_urls.append(page_url)
                print(f"   Crawled: {title[:60]}...")
        else:
            print(f"   [Warning] No pages crawled or empty data returned. Job response: {type(job)}")
            
        return scraped_pages, source_urls
        
    except Exception as e:
        print(f"   [Error] Failed to crawl {url}: {e}")
        return [], []


def search_hotel_info(url: str) -> tuple[list[dict], list[str]]:
    """
    Fallback: Use Tavily search to find information about the hotel if crawling fails.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return [], []
        
    try:
        client = TavilyClient(api_key=api_key)
        print(f"   [Fallback] Searching for info about {url} using Tavily...")
        
        search_query = f"detailed information, amenities, room types, and dining for hotel: {url}"
        results = client.search(query=search_query, search_depth="advanced", max_results=5)
        
        scraped_pages = []
        source_urls = []
        
        for res in results.get('results', []):
            scraped_pages.append({
                "url": res.get('url'),
                "title": res.get('title'),
                "snippet": res.get('content'),
                "content": res.get('content'),
            })
            source_urls.append(res.get('url'))
            
        return scraped_pages, source_urls
    except Exception as e:
        print(f"   [Error] Fallback search failed: {e}")
        return [], []


def web_researcher(state: AEOState) -> dict:
    """
    Web Researcher Agent node for LangGraph.
    
    Crawls the provided hotel_url using Firecrawl.
    """
    hotel_url = state.get("hotel_url", "").strip()
    
    print(f"\n>> [Web Researcher] Researching: {hotel_url}")
    
    if not hotel_url:
        print("   [Error] No hotel URL provided")
        return {
            "raw_hotel_data": {"error": "No URL provided"},
            "sources": [],
        }
    
    # ── Crawl the hotel website ──
    print(f"   Mode: Website Crawl")
    scraped_pages, source_urls = crawl_hotel_site(hotel_url)
    
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
    
    print(f"   Found {len(scraped_pages)} source pages")
    
    return {
        "raw_hotel_data": {
            "source_type": "crawl",
            "hotel_url": hotel_url,
            "pages": scraped_pages,
        },
        "sources": source_urls,
    }
