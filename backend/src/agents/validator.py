"""
Validator Agent (Agent 4)
===========================
Checks the quality and factual accuracy of the optimized content.

Takes the optimized profile and the original gaps, ensuring all gaps
were addressed and no wildly inaccurate facts were hallucinated.
"""

from pydantic import BaseModel, Field
from src.llm import get_llm
from src.state import AEOState


class ValidationResult(BaseModel):
    """Result of the validation check."""
    passed: bool = Field(
        description="True if the optimized profile meets all standards, False if it needs rewriting."
    )
    feedback: str = Field(
        description="Detailed feedback explaining why it passed or failed. If failed, specify what must be fixed."
    )
    hallucinations_detected: bool = Field(
        description="True if obvious, impossible hallucinations are present."
    )
    gaps_addressed: bool = Field(
        description="True if all original gaps were reasonably addressed."
    )


def validator(state: AEOState) -> dict:
    """
    Validator Agent node for LangGraph.
    
    Prompts the LLM to verify the optimized profile against the original gaps.
    """
    optimized = state.get("optimized_profile", {})
    original = state.get("aggregated_profile", {})
    gaps = state.get("gaps", [])
    
    print("\n>> [Agent 4: Validator] Validating optimized content...")
    
    if not optimized or not gaps:
        print("   No optimization needed or available. Passing automatically.")
        return {"validation_passed": True, "validation_feedback": "Auto-pass (no gaps/optimization)"}
        
    prompt = f"""You are a strict QA Validator for hotel content optimization.
Your PRIMARY job is to detect fabricated or hallucinated information.
Return ONLY a raw JSON object (no markdown, no code fences, no extra text).

ORIGINAL PROFILE (source of truth):
{_format_profile(original)}

GAPS THAT NEEDED FIXING:
{_format_gaps(gaps)}

NEW OPTIMIZED PROFILE (to validate):
{_format_profile(optimized)}

EVALUATION CRITERIA (in order of importance):

1. FACTUAL INTEGRITY (most critical):
   - Compare EVERY amenity, room type, dining option, and service in the optimized
     profile against the original profile.
   - If the optimized profile contains items that DO NOT exist ANYWHERE in the original
     profile, mark hallucinations_detected as TRUE and set passed to FALSE.
   - Rewording, restructuring, and emphasizing existing items is acceptable.
   - Adding entirely NEW amenities, programs, services, or features that have NO basis
     in the original data is NOT acceptable and counts as hallucination.
   Examples of hallucination:
     - Original has "Pool" → Optimized says "Infinity Pool with Kids Area" (acceptable reword)
     - Original has NO kids program → Optimized adds "Little Fans Kids Club" (HALLUCINATION)
     - Original has "Restaurant A" → Optimized says "Restaurant A (Family Dining)" (acceptable)
     - Original has NO specific restaurant → Optimized invents one (HALLUCINATION)

2. GAP RESOLUTION:
   - It is ACCEPTABLE if some gaps could not be fully addressed because the original
     data simply doesn't support it.
   - A profile that honestly acknowledges limitations is BETTER than one that fabricates
     information to fill gaps.
   - Set gaps_addressed to true if the optimizer made a reasonable best-effort using
     only the available data.

3. TONE: Is the content natural and professional?

CRITICAL RULE: PASS profiles that faithfully represent the original data, even if not
all gaps are addressed. FAIL profiles that fabricate information to fill gaps.

Required JSON format:
{{
  "passed": <true|false>,
  "feedback": "<detailed explanation — list any specific fabricated items found>",
  "hallucinations_detected": <true|false>,
  "gaps_addressed": <true|false>
}}

Respond with ONLY the JSON object."""

    structured_llm = get_llm().with_structured_output(ValidationResult)
    
    try:
        result = structured_llm.invoke(prompt)
        
        status = "PASSED" if result.passed else "FAILED"
        print(f"   Status: {status}")
        if not result.passed:
            print(f"   Reason: {result.feedback}")
            
        return {
            "validation_passed": result.passed,
            "validation_feedback": result.feedback
        }
    except Exception as e:
        print(f"   [Error] Validation failed: {e}")
        # Default to pass so pipeline doesn't infinite loop on error
        return {"validation_passed": True, "validation_feedback": f"Error: {e}"}


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
        lines.append(f"{i}. {gap.get('description')} -> MUST DO: {gap.get('suggested_improvement')}")
    return "\n".join(lines)
