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
        # Crawl the site up to 4 pages to get comprehensive info without exploding token count
        job = app.crawl(
            url, 
            limit=4, 
            scrape_options={'formats': ['markdown']}
        )
        
        scraped_pages = []
        source_urls = []
        
        # In firecrawl SDK v2, job.data contains a list of Document objects
        if hasattr(job, 'data') and job.data:
            for doc in job.data:
                page_url = getattr(doc.metadata, 'source_url', url) if hasattr(doc, 'metadata') else url
                title = getattr(doc.metadata, 'title', page_url) if hasattr(doc, 'metadata') else page_url
                
                # Extract markdown from Document object
                content = getattr(doc, 'markdown', "")
                if not content:
                    content = str(doc)
                    
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
            print("   [Warning] No pages crawled or empty data returned.")
            
        return scraped_pages, source_urls
        
    except Exception as e:
        print(f"   [Error] Failed to crawl {url}: {e}")
        return [{"url": url, "title": "Error", "snippet": "", "content": f"[Failed to crawl: {e}]"}], []


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
    
    if not scraped_pages:
        print("   [Warning] No results found from crawl")
    
    print(f"   Found {len(scraped_pages)} source pages")
    
    return {
        "raw_hotel_data": {
            "source_type": "crawl",
            "hotel_url": hotel_url,
            "pages": scraped_pages,
        },
        "sources": source_urls,
    }
