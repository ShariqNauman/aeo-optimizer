"""
Optimization Agent (Agent 3)
==============================
Rewrites and enhances the hotel profile to address identified gaps.

Takes the original aggregated profile and the list of gaps, and 
outputs a new, optimized profile that resolves those weaknesses.
"""

from src.llm import get_llm
from src.state import AEOState
from src.agents.data_aggregation import HotelProfile


def optimizer(state: AEOState) -> dict:
    """
    Optimization Agent node for LangGraph.
    
    Prompts the LLM to rewrite the hotel profile based on the gaps.
    """
    original_profile = state.get("aggregated_profile", {})
    gaps = state.get("gaps", [])
    query = state.get("traveller_query", "")
    retry_count = state.get("retry_count", 0)
    validation_feedback = state.get("validation_feedback", "")
    
    print(f"\n>> [Agent 3: Optimizer] Generating optimized content (Retry: {retry_count})...")
    
    # If there are no gaps, just return the original profile
    if not gaps:
        print("   No gaps to optimize. Skipping rewriting.")
        return {"optimized_profile": original_profile}
        
    prompt = f"""You are an expert Answer Engine Optimization (AEO) copywriter.
Your task is to take an existing hotel profile and REWRITE/ENHANCE it to address 
a specific list of content gaps, making it highly optimized for AI travel assistants.

TRAVELLER QUERY THE PROFILE IS OPTIMIZING FOR: "{query}"

ORIGINAL PROFILE:
{_format_profile(original_profile)}

IDENTIFIED GAPS TO FIX:
{_format_gaps(gaps)}

"""
    if validation_feedback and retry_count > 0:
        prompt += f"""
PREVIOUS VALIDATION FAILED WITH THIS FEEDBACK:
"{validation_feedback}"
Please ensure you fix these specific validation issues in this attempt!
"""

    prompt += """
INSTRUCTIONS:
1. Rewrite the description, amenities, room types, dining options, and USPs to directly
   address the gaps.
2. If a gap asks for specific details (like "family amenities"), add reasonable, standard 
   details that fit a hotel of this caliber if they weren't explicitly in the original, 
   but DO NOT hallucinate wildly false claims (e.g., don't invent a beach if it's in a city).
3. Ensure the tone is natural, professional, and appealing to humans, but highly 
   structured and clear for AI parsing.
4. Set `structured_data_available` to True.
5. Return the full, updated profile.
"""

    llm = get_llm()
    structured_llm = llm.with_structured_output(HotelProfile)
    
    try:
        optimized = structured_llm.invoke(prompt)
        print("   Optimization complete. Profile enhanced.")
        return {
            "optimized_profile": optimized.model_dump(),
            "retry_count": retry_count + 1
        }
    except Exception as e:
        print(f"   [Error] Optimizer failed: {e}")
        return {"optimized_profile": original_profile, "retry_count": retry_count + 1}


def _format_profile(profile: dict) -> str:
    if not profile:
        return "None"
    lines = []
    for k, v in profile.items():
        lines.append(f"{k}: {v}")
    return "\n".join(lines)


def _format_gaps(gaps: list[dict]) -> str:
    if not gaps:
        return "None"
    lines = []
    for i, gap in enumerate(gaps, 1):
        lines.append(f"{i}. [{gap.get('category')}] {gap.get('description')} -> FIX: {gap.get('suggested_improvement')}")
    return "\n".join(lines)
