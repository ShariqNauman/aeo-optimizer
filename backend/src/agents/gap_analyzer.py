"""
Gap Analyzer (Agent 2.5)
==========================
Identifies specific content gaps and weaknesses in the hotel profile
that caused it to lose points during the AI simulation.

Takes the aggregated profile + evaluation results and produces a
prioritised list of gaps with suggested improvements.
"""

from pydantic import BaseModel, Field
from src.llm import get_llm
from src.state import AEOState


# ── Pydantic schema for gap analysis ─────────────────────────────────

class Gap(BaseModel):
    """A single identified gap or weakness in the hotel profile."""
    category: str = Field(
        description="Which evaluation criterion this gap affects: "
                    "'relevance', 'completeness', 'trust_signals', "
                    "'value_proposition', or 'structured_data_quality'"
    )
    description: str = Field(
        description="Clear description of what is missing or weak"
    )
    severity: str = Field(
        description="Impact level: 'high', 'medium', or 'low'"
    )
    suggested_improvement: str = Field(
        description="Specific, actionable suggestion to fix this gap"
    )
    estimated_point_gain: int = Field(
        description="How many points (out of 100) fixing this could recover"
    )


class GapAnalysisResult(BaseModel):
    """Complete gap analysis output."""
    gaps: list[Gap] = Field(
        description="List of identified gaps, ordered by severity (high first)"
    )
    summary: str = Field(
        description="One-paragraph summary of the key areas for improvement"
    )
    total_recoverable_points: int = Field(
        description="Estimated total points that could be gained by fixing all gaps"
    )


def gap_analyzer(state: AEOState) -> dict:
    """
    Gap Analyzer node for LangGraph.

    Analyses the hotel profile alongside the simulation scores to
    identify specific, actionable gaps.
    """
    profile = state.get("aggregated_profile", {})
    score = state.get("evaluation_score", 0)
    reasoning = state.get("evaluation_reasoning", "")
    sub_scores = state.get("sub_scores", {})
    query = state.get("traveller_query", "")

    print(f"\n>> [Agent 2.5: Gap Analyzer] Analysing gaps (score: {score}/100)...")

    prompt = f"""You are an AEO (Answer Engine Optimization) expert identifying content gaps in a hotel profile.
Return ONLY a raw JSON object (no markdown, no code fences, no extra text).

TRAVELLER QUERY: "{query}"

HOTEL PROFILE:
{_format_profile(profile)}

EVALUATION RESULTS:
  Overall Score: {score}/100
  Sub-scores:
    - Relevance: {sub_scores.get('relevance', 'N/A')}/20
    - Completeness: {sub_scores.get('completeness', 'N/A')}/20
    - Trust Signals: {sub_scores.get('trust_signals', 'N/A')}/20
    - Value Proposition: {sub_scores.get('value_proposition', 'N/A')}/20
    - Structured Data Quality: {sub_scores.get('structured_data_quality', 'N/A')}/20
  Reasoning: {reasoning}

INSTRUCTIONS:
1. Identify every specific gap that caused the hotel to lose points.
2. For each gap: specify criterion, describe the issue, rate severity (high/medium/low), suggest a concrete fix, estimate point gain.
3. Focus on ACTIONABLE digital content improvements only.
4. Order gaps by severity (high first).
5. Be specific — not "add amenities" but "list kids pool, babysitting, family packages".

Required JSON format:
{{
  "gaps": [
    {{
      "category": "<relevance|completeness|trust_signals|value_proposition|structured_data_quality>",
      "description": "<what is missing or weak>",
      "severity": "<high|medium|low>",
      "suggested_improvement": "<specific actionable fix>",
      "estimated_point_gain": <int>
    }}
  ],
  "summary": "<one paragraph summary>",
  "total_recoverable_points": <int>
}}

Respond with ONLY the JSON object."""

    structured_llm = get_llm().with_structured_output(GapAnalysisResult)

    try:
        result = structured_llm.invoke(prompt)

        # Print summary
        print(f"   Found {len(result.gaps)} gaps")
        print(f"   Recoverable points: ~{result.total_recoverable_points}")
        for i, gap in enumerate(result.gaps, 1):
            severity_icon = {"high": "!!!", "medium": "!!", "low": "!"}.get(gap.severity, "?")
            print(f"   [{severity_icon}] {gap.category}: {gap.description[:60]}...")

        return {
            "gaps": [g.model_dump() for g in result.gaps],
        }

    except Exception as e:
        print(f"   [Error] Gap analysis failed: {e}")
        return {
            "gaps": [{"category": "error", "description": str(e),
                       "severity": "high", "suggested_improvement": "Retry",
                       "estimated_point_gain": 0}],
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
