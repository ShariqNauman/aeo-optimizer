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
        
    prompt = f"""You are an expert AEO copywriter rewriting a hotel profile to fix content gaps.
Return ONLY a raw JSON object (no markdown, no code fences, no extra text).

TRAVELLER QUERY: "{query}"

ORIGINAL PROFILE:
{_format_profile(original_profile)}

IDENTIFIED GAPS TO FIX:
{_format_gaps(gaps)}
"""
    if validation_feedback and retry_count > 0:
        prompt += f"""
PREVIOUS VALIDATION FEEDBACK:
"{validation_feedback}"

IMPORTANT: If the validation failed because you added information that does NOT exist
in the original profile, you MUST REMOVE those fabricated items in this attempt.
It is better to leave a gap unaddressed than to invent information.
Only use what the original profile provides. Do NOT add new items to pass validation.
"""
    prompt += """
INSTRUCTIONS:
1. Rewrite description, amenities, room_types, dining_options, and unique_selling_points to address every gap.
2. You must ONLY refine, restructure, and enhance information that ALREADY EXISTS in the original profile.
3. DO NOT invent new amenities, services, programs, or features that are not present in the original profile just to match the traveller's query. If the hotel does not have a specific feature, do not add it.
4. You may reword, reorganize, and emphasize existing attributes for better machine readability and semantic clarity.
5. Ensure the tone is natural and professional.
6. Set structured_data_available to true.

HARD CONSTRAINT: Never fabricate or hallucinate information. Only work with what the original profile provides. Your job is to optimize presentation, not to create fiction.

Required JSON fields: name, location, star_rating, description, amenities (list),
room_types (list), dining_options (list), price_range, review_summary,
unique_selling_points (list), nearby_attractions (list), contact_info, structured_data_available (bool).

Respond with ONLY the JSON object."""

    structured_llm = get_llm().with_structured_output(HotelProfile)
    
    try:
        optimized = structured_llm.invoke(prompt)
        
        if optimized is None:
            raise ValueError("LLM returned None for optimized structured output.")
            
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
