import os
import json
import requests
import concurrent.futures
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from typing import List, Optional
from pydantic import BaseModel, Field, AliasChoices
from src.llm import get_llm, get_search_llm

def _check_url(url: str, timeout: int = 8) -> bool:
    """Low-level check: returns True if URL is reachable (HTTP 200-399)."""
    if not url or not url.startswith("http"):
        return False
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        resp = requests.head(url, timeout=timeout, allow_redirects=True, headers=headers, verify=False)
        if resp.status_code >= 400:
            resp = requests.get(url, timeout=timeout, allow_redirects=True, headers=headers, stream=True, verify=False)
        return resp.status_code < 400
    except Exception:
        try:
            resp = requests.get(url, timeout=timeout, allow_redirects=True, headers=headers, stream=True, verify=False)
            return resp.status_code < 400
        except Exception:
            return False


def _generate_url_variations(url: str) -> list[str]:
    """Generate common TLD variations for a URL to fix LLM hallucinated domains."""
    from urllib.parse import urlparse
    variations = []
    parsed = urlparse(url)
    domain = parsed.netloc
    scheme = parsed.scheme or "https"
    path = parsed.path

    # .com.my → .com (strip ".my")
    if domain.endswith(".com.my"):
        alt_domain = domain[:-3]  # strip ".my"
        variations.append(f"{scheme}://{alt_domain}{path}")
    # .com → .com.my (add ".my" for Malaysian hotels)
    elif domain.endswith(".com") and not domain.endswith(".com.my"):
        alt_domain = domain + ".my"
        variations.append(f"{scheme}://{alt_domain}{path}")
    # .my (non .com.my) → .com
    elif domain.endswith(".my"):
        alt_domain = domain[:-3] + ".com"
        variations.append(f"{scheme}://{alt_domain}{path}")
    
    # Try adding/removing www
    if domain.startswith("www."):
        variations.append(f"{scheme}://{domain[4:]}{path}")
    else:
        variations.append(f"{scheme}://www.{domain}{path}")

    return variations


def verify_and_fix_url(url: str) -> str:
    """
    Verify a URL is reachable. If not, try common TLD variations.
    Returns the working URL, or empty string if nothing works.
    """
    if not url:
        return ""

    # 1. Try the original URL first
    if _check_url(url):
        return url

    # 2. Try common variations (e.g., .com.my → .com)
    for alt_url in _generate_url_variations(url):
        if _check_url(alt_url):
            print(f"   [URL Fix] {url} → {alt_url}")
            return alt_url

    return ""


class HotelDiscoveryResult(BaseModel):
    name: str = Field(description="The name of the hotel")
    url: str = Field(
        validation_alias=AliasChoices('url', 'official_url', 'website', 'official_website'),
        description="The official website URL of the hotel"
    )

class DiscoveryResponse(BaseModel):
    hotels: List[HotelDiscoveryResult] = Field(description="A list of discovered hotels")

class QueryValidation(BaseModel):
    is_valid: bool = Field(description="True if the query is a legitimate hotel or travel-related search query, False otherwise")
    reason: str = Field(description="Brief reason for the validation result")
    suggested_query: Optional[str] = Field(description="If invalid, a suggestion for a better query. If valid, the original or a slightly improved query.")

class UrlValidation(BaseModel):
    is_valid: bool = Field(description="True if the URL is likely a legitimate hotel or resort website, False otherwise")
    reason: str = Field(description="Brief reason for the validation result")

def validate_query(query: str) -> QueryValidation:
    """Uses Gemini to validate if the user query is a legitimate travel/hotel query."""
    print(f"   [Gemini] Validating query: '{query}'")
    
    # Basic pre-validation
    clean_query = query.strip()
    if len(clean_query) < 3:
        return QueryValidation(
            is_valid=False, 
            reason="Query is too short. Please provide a more specific hotel or location.",
            suggested_query=None
        )

    structured_llm = get_llm().with_structured_output(QueryValidation)
    
    prompt = f"""
    You are a travel query validator. Your job is to determine if a user's query is a legitimate request to find hotels, resorts, or travel accommodations.
    
    User Query: "{query}"
    
    Criteria for Validity:
    1. It must have some relation to travel, hotels, locations, or stay requirements.
    2. Nonsense strings (e.g., "s", "asdf", "123", random letters) should be marked as invalid.
    3. Single letters or very short words with no location context are invalid.
    
    Return a JSON object with:
    - is_valid: boolean
    - reason: explanation (max 10 words)
    - suggested_query: a better version if it has intent but is vague, or None if it's pure nonsense.
    """
    
    try:
        result = structured_llm.invoke(prompt)
        return result
    except Exception as e:
        print(f"   [Error] Validation failed: {e}")
        return QueryValidation(is_valid=True, reason="Validation skipped due to error", suggested_query=query)

def validate_url(url: str) -> UrlValidation:
    """Uses Gemini to validate if the provided URL is likely a hotel website."""
    print(f"   [Gemini] Validating URL: '{url}'")
    
    structured_llm = get_llm().with_structured_output(UrlValidation)
    
    prompt = f"""
    You are a website validator for a hotel optimization tool. Your job is to determine if the provided URL is likely the official website of a hotel, resort, or accommodation.
    
    URL: "{url}"
    
    Criteria for Validity:
    1. The URL should point to a hotel, resort, inn, boutique stay, or similar lodging.
    2. Booking platforms (Expedia, Booking.com, Airbnb, etc.) are NOT official hotel websites, but for this tool, they might be acceptable if they point to a specific hotel listing. However, general sites like google.com, facebook.com, or news sites are INVALID.
    3. The domain name often contains "hotel", "resort", "inn", or the property name.
    
    Return a JSON object with:
    - is_valid: boolean
    - reason: explanation (max 10 words)
    """
    
    try:
        result = structured_llm.invoke(prompt)
        return result
    except Exception as e:
        print(f"   [Error] URL validation failed: {e}")
        return UrlValidation(is_valid=True, reason="Validation skipped due to error")

def discover_hotels(user_query: str) -> List[dict]:
    """
    Standalone agent that uses Gemini with Google Search grounding to:
    1. Search the web for hotels matching the user's natural language query.
    2. Extract hotel names and their official website URLs.
    3. Returns a list of up to 10 hotel results.
    """
    print(f"\n>> [Discovery Agent] Searching for: {user_query}")
    
    # 0. Validate Query
    validation = validate_query(user_query)
    if not validation.is_valid:
        print(f"   [Validation Failed] {validation.reason}")
        return []
        
    actual_query = validation.suggested_query if validation.suggested_query else user_query
    
    # 1. Use Gemini with Google Search grounding to find hotels
    search_llm = get_search_llm()
    
    search_prompt = f"""Search the web and find the top 10 HOTELS, RESORTS, or LODGING ACCOMMODATIONS that match this travel query: "{actual_query}"

For each hotel, provide:
1. The full official name of the hotel
2. The official website URL (NOT booking sites like Expedia, Booking.com, or TripAdvisor - find the hotel's own website)

Format your response as a JSON array like this:
[
  {{"name": "Hotel Name", "url": "https://www.hotelwebsite.com"}},
  ...
]

Important:
- Only include real, currently operating hotels, resorts, inns, boutique stays, or serviced apartments
- NEVER include healthcare facilities, nursing homes, assisted living centers, rehabilitation centres, hospitals, clinics, or any non-lodging business
- NEVER include retirement homes, elder care facilities, or care homes
- For resorts with golf courses/country clubs, provide the URL for the HOTEL booking site, NOT the golf club membership/course site.
- Every result MUST be a place where travellers can book overnight accommodation
- Make sure URLs are accurate and point to the hotel's official website
- Include up to 10 results
- Return ONLY the JSON array, nothing else"""

    print(f"   [Gemini Search] Executing grounded search...")
    
    try:
        search_response = search_llm.invoke(search_prompt)
        raw_text = search_response.content
        print(f"   [Gemini Search] Got response, parsing results...")
        
        # 2. Parse the grounded search results with structured LLM
        structured_llm = get_llm().with_structured_output(DiscoveryResponse)
        
        parse_prompt = f"""
        You are an expert travel researcher. I will provide you with search results for a hotel query.
        Your task is to extract the hotels from these results into a structured format.

        User Query: {user_query}

        Search Results:
        {raw_text}

        Return the result in a strictly structured JSON format with the following keys:
        - hotels: A list of objects, each containing:
            - "name": The name of the hotel.
            - "url": The OFFICIAL website URL of the hotel (avoid booking sites like Expedia, Booking.com, or TripAdvisor).

        CRITICAL: Only include hotels, resorts, and lodging accommodations.
        Exclude any result that is NOT a bookable overnight accommodation (e.g., healthcare, nursing homes, clinics, care homes).
        If a hotel is part of a larger country club or golf resort, ensure the URL provided is for the HOTEL accommodation, not the golf course or membership page.

        Example JSON output:
        {{
          "hotels": [
            {{
              "name": "Mandarin Oriental Kuala Lumpur",
              "url": "https://www.mandarinoriental.com/kuala-lumpur"
            }}
          ]
        }}
        """
        
        response: DiscoveryResponse = structured_llm.invoke(parse_prompt)
        print(f"   [Discovery Agent] Found {len(response.hotels)} hotels. Verifying URLs...")
        
        hotels_data = [hotel.model_dump() for hotel in response.hotels]
        
        # 3. Concurrent URL verification + auto-fix
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_index = {executor.submit(verify_and_fix_url, h["url"]): i for i, h in enumerate(hotels_data)}
            
            for future in concurrent.futures.as_completed(future_to_index):
                index = future_to_index[future]
                fixed_url = future.result()
                if not fixed_url:
                    print(f"   [URL Check] FAILED for {hotels_data[index]['name']}: {hotels_data[index]['url']}")
                hotels_data[index]["url"] = fixed_url  # Use fixed URL or empty string
        
        print(f"   [Discovery Agent] Verification complete.")
        return hotels_data
        
    except Exception as e:
        print(f"   [Error] Gemini search failed: {e}")
        print(f"   [Fallback] Attempting direct structured search...")
        
        # Fallback: Try a simpler direct approach without grounding
        try:
            structured_llm = get_llm().with_structured_output(DiscoveryResponse)
            
            fallback_prompt = f"""
            You are an expert travel researcher with deep knowledge of the global hotel industry.
            Based on your knowledge, recommend the top 5 HOTELS or RESORTS that match this query: "{actual_query}"

            For each hotel, provide:
            - "name": The full official name of the hotel
            - "url": The most likely official website URL

            Important:
            - Only include real, currently operating hotels or resorts.
            - NEVER include healthcare facilities, nursing homes, or care centres.
            - For golf resorts, provide the hotel URL, not the golf club URL.
            - Return a structured list of hotels.
            """
            
            response: DiscoveryResponse = structured_llm.invoke(fallback_prompt)
            print(f"   [Fallback] Found {len(response.hotels)} hotels. Verifying URLs...")
            
            hotels_data = [hotel.model_dump() for hotel in response.hotels]
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                future_to_index = {executor.submit(verify_and_fix_url, h["url"]): i for i, h in enumerate(hotels_data)}
                for future in concurrent.futures.as_completed(future_to_index):
                    index = future_to_index[future]
                    fixed_url = future.result()
                    if not fixed_url:
                        print(f"   [URL Check] FAILED for {hotels_data[index]['name']}: {hotels_data[index]['url']}")
                    hotels_data[index]["url"] = fixed_url
            
            return hotels_data
        except Exception as e2:
            print(f"   [Error] Fallback also failed: {e2}")
            return []

if __name__ == "__main__":
    # Test the agent
    from dotenv import load_dotenv
    load_dotenv()
    results = discover_hotels("luxury hotel in KLCC with pool")
    print("\nResults:")
    for r in results:
        print(f"- {r['name']}: {r['url']}")
