import os
from typing import List, Optional
from pydantic import BaseModel, Field, AliasChoices
from tavily import TavilyClient
from src.llm import get_llm

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

def discover_hotels(user_query: str) -> List[dict]:
    """
    Standalone agent that:
    1. Searches for hotels based on user's natural language query using Tavily.
    2. Parses the results using Gemini to extract hotel names and official URLs.
    3. Returns a list of results.
    """
    print(f"\n>> [Discovery Agent] Searching for: {user_query}")
    
    # 0. Validate Query
    validation = validate_query(user_query)
    if not validation.is_valid:
        print(f"   [Validation Failed] {validation.reason}")
        return []
        
    actual_query = validation.suggested_query if validation.suggested_query else user_query
    
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    if not tavily_api_key:
        print("   [Error] TAVILY_API_KEY is not set in .env")
        return []

    client = TavilyClient(api_key=tavily_api_key)
    
    # 1. Search Tavily
    # We use 'search' for general results. We could also use 'context' or 'qna'.
    search_query = f"official website of top hotels for: {user_query}"
    print(f"   [Tavily] Executing search: {search_query}")
    
    search_results = client.search(
        query=search_query,
        search_depth="advanced",
        max_results=10
    )
    
    # 2. Parse with Gemini
    print(f"   [Gemini] Parsing {len(search_results['results'])} search results...")
    
    structured_llm = get_llm().with_structured_output(DiscoveryResponse)
    
    prompt = f"""
    You are an expert travel researcher. I will provide you with search results for a hotel query.
    Your task is to extract the TOP 5 most relevant hotels from these results.

    User Query: {user_query}

    Search Results:
    {search_results['results']}

    Return the result in a strictly structured JSON format with the following keys:
    - hotels: A list of objects, each containing:
        - "name": The name of the hotel.
        - "url": The OFFICIAL website URL of the hotel (avoid booking sites like Expedia, Booking.com, or TripAdvisor).

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
    
    try:
        response: DiscoveryResponse = structured_llm.invoke(prompt)
        print(f"   [Discovery Agent] Successfully found {len(response.hotels)} hotels.")
        return [hotel.model_dump() for hotel in response.hotels]
    except Exception as e:
        print(f"   [Error] Failed to parse discovery results: {e}")
        return []

if __name__ == "__main__":
    # Test the agent
    from dotenv import load_dotenv
    load_dotenv()
    results = discover_hotels("luxury hotel in KLCC with pool")
    print("\nResults:")
    for r in results:
        print(f"- {r['name']}: {r['url']}")
