"""
Data Aggregation Agent (Agent 1)
==================================
Takes raw scraped hotel data from the Web Researcher and uses Gemini
to extract a clean, structured hotel profile.

Uses Pydantic + with_structured_output() to guarantee the LLM returns
data in the exact schema we need.
"""

from pydantic import BaseModel, Field
from src.llm import get_llm
from src.state import AEOState


# ── Pydantic schema for structured hotel profile ─────────────────────
# This defines EXACTLY what the LLM must return. Gemini will be
# constrained to output JSON matching this schema.

class HotelProfile(BaseModel):
    """Structured hotel profile extracted from raw web data."""
    name: str = Field(description="Official name of the hotel")
    location: str = Field(description="Full address or city/country")
    star_rating: float = Field(description="Star rating (1-5), use 0 if unknown")
    description: str = Field(description="Brief 2-3 sentence description of the hotel")
    amenities: list[str] = Field(description="List of amenities (pool, spa, gym, etc.)")
    room_types: list[str] = Field(description="Types of rooms available")
    dining_options: list[str] = Field(description="Restaurants, bars, dining facilities")
    price_range: str = Field(description="Approximate price range per night (e.g. '$150-$300')")
    review_summary: str = Field(description="Summary of guest reviews and sentiment")
    unique_selling_points: list[str] = Field(description="What makes this hotel stand out")
    nearby_attractions: list[str] = Field(description="Notable nearby places and attractions")
    contact_info: str = Field(description="Phone, email, or website if available")
    structured_data_available: bool = Field(
        description="Whether the hotel appears to have schema.org or structured data markup"
    )


def _format_raw_data(raw_data: dict) -> str:
    """Convert raw_hotel_data dict into a readable text block for the LLM."""
    source_type = raw_data.get("source_type", "unknown")
    
    if source_type == "direct_url":
        return (
            f"Source: Direct URL ({raw_data.get('url', 'N/A')})\n\n"
            f"Content:\n{raw_data.get('content', 'No content available')}"
        )
    
    elif source_type in ("search", "crawl"):
        parts = [f"Hotel URL: {raw_data.get('hotel_url', 'N/A')}\n"]
        for i, page in enumerate(raw_data.get("pages", []), 1):
            parts.append(f"\n--- Source {i}: {page.get('title', 'N/A')} ---")
            parts.append(f"URL: {page.get('url', 'N/A')}")
            parts.append(f"Snippet: {page.get('snippet', 'N/A')}")
            parts.append(f"Content:\n{page.get('content', 'No content')[:3000]}")
        return "\n".join(parts)
    
    else:
        return str(raw_data)


def data_aggregation(state: AEOState) -> dict:
    """
    Data Aggregation Agent node for LangGraph.
    
    Takes raw_hotel_data from the Web Researcher and uses Gemini
    to extract a structured HotelProfile.
    """
    raw_data = state.get("raw_hotel_data", {})
    hotel_input = state.get("hotel_url", "Unknown Hotel")
    
    print(f"\n>> [Agent 1: Data Aggregation] Structuring data for: {hotel_input}")
    
    # Format the raw data into readable text
    raw_text = _format_raw_data(raw_data)
    
    # Build the prompt
    prompt = f"""You are a hotel data analyst. Extract a comprehensive, structured hotel profile 
from the following raw web data. Fill in as much detail as possible from the provided content.
If certain information is not available, make reasonable inferences based on what IS available,
but mark uncertain fields clearly.

Hotel being analyzed: {hotel_input}

Raw Data:
{raw_text}

Extract all relevant hotel information into the structured format.
Be thorough — include every amenity, room type, and dining option you can find."""
    
    # Use Gemini with structured output
    llm = get_llm()
    structured_llm = llm.with_structured_output(HotelProfile)
    
    try:
        profile = structured_llm.invoke(prompt)
        profile_dict = profile.model_dump()
        
        # Print a summary
        print(f"   Name:     {profile.name}")
        print(f"   Location: {profile.location}")
        print(f"   Rating:   {profile.star_rating} stars")
        print(f"   Amenities: {len(profile.amenities)} found")
        print(f"   USPs:     {len(profile.unique_selling_points)} found")
        
        return {"aggregated_profile": profile_dict}
        
    except Exception as e:
        print(f"   [Error] Structured extraction failed: {e}")
        # Fallback: return raw data as-is
        return {"aggregated_profile": {"error": str(e), "raw_fallback": raw_data}}
