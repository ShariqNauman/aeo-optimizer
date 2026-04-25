"""
Data Aggregation Agent (Agent 1)
==================================
Takes raw scraped hotel data from the Web Researcher and uses Gemini
to extract a clean, structured hotel profile.

Uses Pydantic + with_structured_output() to guarantee the LLM returns
data in the exact schema we need.
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator
from src.llm import get_llm
from src.state import AEOState


# ── Pydantic schema for structured hotel profile ─────────────────────
# This defines EXACTLY what the LLM must return. Gemini will be
# constrained to output JSON matching this schema.

class HotelProfile(BaseModel):
    """Structured hotel profile extracted from raw web data."""
    name: str = Field(description="Official name of the hotel")
    location: str = Field(description="Full address or city/country")
    star_rating: float = Field(default=0.0, description="Star rating (1-5), use 0 if unknown")
    description: str = Field(default="", description="Brief 2-3 sentence description of the hotel")
    amenities: list[str] = Field(default_factory=list, description="List of amenities (pool, spa, gym, etc.)")
    room_types: list[str] = Field(default_factory=list, description="Types of rooms available")
    dining_options: list[str] = Field(default_factory=list, description="Restaurants, bars, dining facilities")
    price_range: Optional[str] = Field(default="Unknown", description="Approximate price range per night (e.g. '$150-$300')")
    review_summary: Optional[str] = Field(default="No reviews available.", description="Summary of guest reviews and sentiment")
    unique_selling_points: list[str] = Field(default_factory=list, description="What makes this hotel stand out")
    nearby_attractions: list[str] = Field(default_factory=list, description="Notable nearby places and attractions")
    contact_info: Optional[str] = Field(default="", description="Phone, email, or website if available")
    structured_data_available: bool = Field(default=False, description="Whether the hotel has schema.org markup")

    @field_validator("star_rating", mode="before")
    @classmethod
    def coerce_star_rating(cls, v):
        """Handle None or invalid star rating."""
        if v is None: return 0.0
        try: return float(v)
        except (ValueError, TypeError): return 0.0

    @field_validator("description", "contact_info", "price_range", "review_summary", mode="before")
    @classmethod
    def coerce_to_str(cls, v):
        """Ensure field is a string and handle None."""
        if v is None: return ""
        if isinstance(v, dict):
            return " | ".join(f"{k}: {val}" for k, val in v.items() if val)
        return str(v)

    @field_validator("amenities", "room_types", "dining_options", "unique_selling_points", "nearby_attractions", mode="before")
    @classmethod
    def flatten_to_strings(cls, v):
        """
        Gemini often returns a list of objects instead of strings for these fields.
        Flatten them to strings: {'name': 'X', 'details': 'Y'} -> 'X: Y'
        """
        if not isinstance(v, list):
            return [str(v)] if v else []
            
        flattened = []
        for item in v:
            if isinstance(item, dict):
                # Try to find a name or title, then append other fields
                name = item.pop('name', item.pop('title', ''))
                details = " | ".join(f"{k}: {val}" for k, val in item.items() if val)
                if name and details:
                    flattened.append(f"{name} ({details})")
                elif name:
                    flattened.append(str(name))
                elif details:
                    flattened.append(details)
            else:
                flattened.append(str(item))
        return flattened


# Maximum characters of raw web content sent to the LLM.
_MAX_RAW_CHARS = 100000


def _format_raw_data(raw_data: dict) -> str:
    """Convert raw_hotel_data dict into a readable text block for the LLM."""
    source_type = raw_data.get("source_type", "unknown")
    
    if source_type == "direct_url":
        content = raw_data.get('content', 'No content available')[:_MAX_RAW_CHARS]
        return (
            f"Source: Direct URL ({raw_data.get('url', 'N/A')})\n\n"
            f"Content:\n{content}"
        )
    
    elif source_type in ("search", "crawl"):
        parts = [f"Hotel URL: {raw_data.get('hotel_url', 'N/A')}\n"]
        per_page = max(1000, _MAX_RAW_CHARS // max(1, len(raw_data.get("pages", []))))
        for i, page in enumerate(raw_data.get("pages", []), 1):
            parts.append(f"\n--- Source {i}: {page.get('title', 'N/A')} ---")
            parts.append(f"URL: {page.get('url', 'N/A')}")
            parts.append(f"Snippet: {page.get('snippet', 'N/A')}")
            parts.append(f"Content:\n{page.get('content', 'No content')[:per_page]}")
        return "\n".join(parts)
    
    else:
        return str(raw_data)[:_MAX_RAW_CHARS]


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
    prompt = f"""You are a hotel data analyst. Extract a structured hotel profile from the web data below.
Return ONLY a raw JSON object (no markdown, no code fences, no extra text).

Hotel: {hotel_input}

Raw Data (truncated):
{raw_text}

JSON fields required: name, location, star_rating, description, amenities (list),
room_types (list), dining_options (list), price_range, review_summary,
unique_selling_points (list), nearby_attractions (list), contact_info,
structured_data_available (bool).

Be thorough — extract every amenity, room type, and dining option you can find.
Respond with ONLY the JSON object."""
    
    # Use Gemini with built-in structured output
    structured_llm = get_llm().with_structured_output(HotelProfile)
    
    try:
        profile = structured_llm.invoke(prompt)
        
        if profile is None:
            raise ValueError("LLM returned None for structured output.")
            
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
