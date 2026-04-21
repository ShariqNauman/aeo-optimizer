"""
AI Decision Simulator (Agent 2)
==================================
Simulates how an AI travel agent would evaluate a hotel when deciding
whether to recommend it to a traveller.

Takes the aggregated hotel profile + traveller query and produces:
  - An overall score (0-100)
  - Sub-scores across 5 criteria
  - Reasoning for the decision
  - A would_recommend boolean
"""

from pydantic import BaseModel, Field
from src.llm import get_llm
from src.state import AEOState


# ── Pydantic schema for the AI evaluation ────────────────────────────

class SubScores(BaseModel):
    """Breakdown scores across 5 AEO criteria (each 0-20, totalling 0-100)."""
    relevance: int = Field(
        description="How well the hotel matches the traveller's specific query (0-20)"
    )
    completeness: int = Field(
        description="How complete and detailed the hotel's data profile is (0-20)"
    )
    trust_signals: int = Field(
        description="Presence of reviews, ratings, certifications, brand recognition (0-20)"
    )
    value_proposition: int = Field(
        description="How compelling the hotel's offering is — amenities, USPs, pricing (0-20)"
    )
    structured_data_quality: int = Field(
        description="Quality of structured/machine-readable data (schema.org, rich snippets) (0-20)"
    )


class SimulationResult(BaseModel):
    """Full evaluation result from the AI travel agent simulation."""
    overall_score: int = Field(
        description="Total score from 0-100 (sum of sub_scores)"
    )
    sub_scores: SubScores = Field(
        description="Breakdown of the score across 5 criteria"
    )
    reasoning: str = Field(
        description="Detailed 3-5 sentence explanation of why the hotel received this score"
    )
    would_recommend: bool = Field(
        description="Whether the AI travel agent would recommend this hotel for the query"
    )
    key_strengths: list[str] = Field(
        description="Top 3 strengths of the hotel profile"
    )
    key_weaknesses: list[str] = Field(
        description="Top 3 weaknesses or missing elements in the hotel profile"
    )


def ai_simulator(state: AEOState) -> dict:
    """
    AI Decision Simulator node for LangGraph.

    Prompts Gemini to role-play as an AI travel recommendation engine
    and score the hotel against the traveller's query.
    """
    profile = state.get("aggregated_profile", {})
    query = state.get("traveller_query", "")

    print(f"\n>> [Agent 2: AI Simulator] Evaluating hotel against query...")
    print(f"   Query: {query}")

    # Build the prompt
    prompt = f"""You are an AI travel recommendation engine. A traveller has submitted the 
following query, and you need to evaluate whether a hotel is a strong match.

TRAVELLER QUERY: "{query}"

HOTEL PROFILE:
{_format_profile(profile)}

EVALUATION CRITERIA (each scored 0-20, totalling 0-100):
1. **Relevance** (0-20): How well does this hotel match what the traveller is looking for?
   Consider: location match, amenity match, price-point alignment, target demographic fit.

2. **Completeness** (0-20): How detailed and comprehensive is the hotel's data profile?
   Consider: are there descriptions, room types, dining options, pricing, contact info?
   Penalise missing fields or vague data.

3. **Trust Signals** (0-20): Does the hotel have credible trust indicators?
   Consider: guest reviews, star rating, brand recognition, certifications, awards.

4. **Value Proposition** (0-20): How compelling is the hotel's overall offering?
   Consider: unique selling points, competitive amenities, clear differentiation.

5. **Structured Data Quality** (0-20): Is the data well-organized for machine consumption?
   Consider: would an AI system easily parse this data? Are there schema.org markers,
   consistent formatting, clear categorization?

Be critical and realistic. A score of 60-70 is average. 80+ is excellent.
The overall_score MUST equal the sum of the 5 sub-scores.
Provide specific, actionable reasoning — not generic praise."""

    llm = get_llm()
    structured_llm = llm.with_structured_output(SimulationResult)

    try:
        result = structured_llm.invoke(prompt)

        # Print summary
        print(f"   Overall Score: {result.overall_score}/100")
        print(f"   Breakdown:")
        print(f"     Relevance:      {result.sub_scores.relevance}/20")
        print(f"     Completeness:   {result.sub_scores.completeness}/20")
        print(f"     Trust Signals:  {result.sub_scores.trust_signals}/20")
        print(f"     Value Prop:     {result.sub_scores.value_proposition}/20")
        print(f"     Structured:     {result.sub_scores.structured_data_quality}/20")
        print(f"   Recommend: {'Yes' if result.would_recommend else 'No'}")

        return {
            "evaluation_score": result.overall_score,
            "evaluation_reasoning": result.reasoning,
            "sub_scores": result.sub_scores.model_dump(),
        }

    except Exception as e:
        print(f"   [Error] Simulation failed: {e}")
        return {
            "evaluation_score": 0,
            "evaluation_reasoning": f"Error: {e}",
            "sub_scores": {
                "relevance": 0, "completeness": 0, "trust_signals": 0,
                "value_proposition": 0, "structured_data_quality": 0,
            },
        }


def _format_profile(profile: dict) -> str:
    """Format hotel profile dict into readable text for the prompt."""
    if not profile:
        return "No hotel profile data available."

    lines = []
    for key, value in profile.items():
        if isinstance(value, list):
            lines.append(f"  {key}: {', '.join(str(v) for v in value)}")
        else:
            lines.append(f"  {key}: {value}")
    return "\n".join(lines)
