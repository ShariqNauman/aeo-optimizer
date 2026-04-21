"""
Re-simulator Agent (Agent 5)
=============================
Re-evaluates the newly optimized profile to prove ROI.

Runs the exact same simulation logic as Agent 2, but applies it to 
the optimized_profile. Calculates the score difference.
"""

from src.state import AEOState
from src.agents.ai_simulator import SimulationResult
from src.llm import get_llm

def resimulator(state: AEOState) -> dict:
    """
    Re-simulator Agent node for LangGraph.
    
    Evaluates the optimized profile to determine the new score and score delta.
    """
    optimized_profile = state.get("optimized_profile", {})
    query = state.get("traveller_query", "")
    original_score = state.get("evaluation_score", 0)
    
    print("\n>> [Agent 5: Re-simulator] Re-evaluating optimized profile...")
    
    if not optimized_profile:
        print("   [Warning] No optimized profile found. Skipping re-simulation.")
        return {"resim_score": original_score, "score_delta": 0}
        
    prompt = f"""You are an advanced AI Travel Assistant (like ChatGPT, Gemini, or Claude).
A traveller has asked you a query. You must evaluate a specific hotel profile 
and decide if you would recommend it to them based on 5 strict criteria.

TRAVELLER QUERY: "{query}"

HOTEL PROFILE TO EVALUATE:
{_format_profile(optimized_profile)}

Score the profile strictly out of 100 based on these criteria:
1. Relevance (20 points)
2. Completeness (20 points)
3. Trust Signals (20 points)
4. Value Proposition (20 points)
5. Structured Data Quality (20 points)
"""

    llm = get_llm()
    structured_llm = llm.with_structured_output(SimulationResult)
    
    try:
        result = structured_llm.invoke(prompt)
        
        score_delta = result.overall_score - original_score
        
        print(f"   New Score:     {result.overall_score}/100")
        print(f"   Score Delta:   +{score_delta} points")
        if not result.would_recommend:
            print("   [Warning] The AI still wouldn't recommend this hotel.")
            
        return {
            "resim_score": result.overall_score,
            "resim_feedback": result.reasoning,
            "score_delta": score_delta
        }
        
    except Exception as e:
        print(f"   [Error] Re-simulation failed: {e}")
        return {"resim_score": original_score, "score_delta": 0}


def _format_profile(profile: dict) -> str:
    if not profile:
        return "None"
    lines = []
    for k, v in profile.items():
        lines.append(f"{k}: {v}")
    return "\n".join(lines)
