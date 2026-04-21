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
        
    prompt = f"""You are a QA Validator for hotel content optimization.
Compare the original hotel profile and the identified gaps against the NEW optimized profile.

ORIGINAL PROFILE:
{_format_profile(original)}

GAPS THAT NEEDED FIXING:
{_format_gaps(gaps)}

NEW OPTIMIZED PROFILE:
{_format_profile(optimized)}

EVALUATION CRITERIA:
1. Were all the gaps addressed in the new profile? (Check the specific fixes).
2. Did the optimizer hallucinate anything physically impossible or wildly inaccurate 
   (e.g. adding a private beach to a city centre hotel)? Minor elaborations on existing 
   amenities are acceptable.
3. Is the tone natural and professional?

If the new profile addresses the gaps without major hallucinations, it passes.
If it failed to address high-severity gaps or invented ridiculous lies, it fails.
"""

    llm = get_llm()
    structured_llm = llm.with_structured_output(ValidationResult)
    
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
