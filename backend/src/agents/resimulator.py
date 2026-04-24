"""
Re-simulator Agent (Agent 5)
=============================
Re-evaluates the newly optimized profile to prove ROI.

Runs the exact same simulation logic as Agent 2, but applies it to 
the optimized_profile. Calculates the score difference.
"""

from src.state import AEOState
from src.agents.ai_simulator import SimulationResult
from src.llm import get_structured_llm

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
        
    prompt = f"""You are an AI travel recommendation engine re-evaluating an optimized hotel profile.
Return ONLY a raw JSON object (no markdown, no code fences, no extra text).

TRAVELLER QUERY: "{query}"

OPTIMIZED HOTEL PROFILE:
{_format_profile(optimized_profile)}

Score the profile strictly out of 100 based on these 5 criteria (each 0-20):
1. Relevance (0-20)
2. Completeness (0-20)
3. Trust Signals (0-20)
4. Value Proposition (0-20)
5. Structured Data Quality (0-20)

Required JSON fields:
{{
  "overall_score": <int 0-100>,
  "sub_scores": {{
    "relevance": <int 0-20>,
    "completeness": <int 0-20>,
    "trust_signals": <int 0-20>,
    "value_proposition": <int 0-20>,
    "structured_data_quality": <int 0-20>
  }},
  "reasoning": "<3-5 sentence explanation>",
  "would_recommend": <true|false>,
  "key_strengths": ["<s1>", "<s2>", "<s3>"],
  "key_weaknesses": ["<w1>", "<w2>", "<w3>"]
}}

Respond with ONLY the JSON object."""

    structured_llm = get_structured_llm(SimulationResult)
    
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
