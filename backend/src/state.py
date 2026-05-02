from typing import TypedDict


class AEOState(TypedDict, total=False):
    """
    Complete state for the AEO Optimizer pipeline.
    
    `total=False` means all fields are optional — this is important because
    at the START of the pipeline, most fields don't exist yet. Each agent
    populates its own fields as the pipeline progresses.
    
    Fields are grouped by which agent produces them:
    """
    
    # ── Input (provided by the user at the start) ──────────────────────
    hotel_url: str                # Official URL of the hotel
    traveller_query: str          # e.g. "budget family hotel in Kuala Lumpur"
    
    # ── Web Researcher output ──────────────────────────────────────────
    raw_hotel_data: dict          # Scraped/searched data from the internet
    sources: list                 # URLs of credible sources used
    raw_html: str                 # Raw HTML from the main hotel page (Firecrawl)
    
    # ── Agent 1: Data Aggregation output ───────────────────────────────
    aggregated_profile: dict      # Cleaned, structured hotel profile
    
    # ── Agent 1.5: SEO Analyzer output ─────────────────────────────────
    seo_scores: dict              # {seo: 85, accessibility: 89, best_practices: 81}
    seo_issues: list              # Failed Lighthouse audits with details
    performance_metrics: dict     # {lcp: "1.2s", fcp: "0.8s", ...}

    # ── Agent 1.75: AEO Analyzer output ────────────────────────────────
    aeo_results: dict             # AEO checks (image alt, llms.txt, semantics)
    
    # ── Agent 2: AI Decision Simulator output ──────────────────────────
    evaluation_score: int         # Overall score 0-100
    evaluation_reasoning: str     # Why the AI agent scored it this way
    sub_scores: dict              # Breakdown: relevance, completeness, etc.
    
    # ── Agent 2.5: Gap Analyzer output ─────────────────────────────────
    gaps: list                    # List of identified weaknesses/gaps
    
    # ── Agent 3: Optimization Agent output ─────────────────────────────
    optimized_profile: dict       # Rewritten/enhanced hotel profile
    optimized_html: str           # Gemini-generated SEO-optimized HTML
    
    # ── Agent 4: Validator Agent output ────────────────────────────────
    validation_passed: bool       # Did the optimized content pass QA?
    validation_feedback: str      # Why it passed or failed
    retry_count: int              # Number of optimizer retries (max 2)
    
    # ── Agent 5: Re-simulation Agent output ────────────────────────────
    resim_score: int              # Score after optimization
    resim_reasoning: str          # Reasoning for the new score
    resim_feedback: str           # Detailed reasoning for the new score
    score_delta: int              # resim_score - evaluation_score
    seo_suggestions: list         # Actionable SEO suggestions from Lighthouse issues
    
    # ── HITL: Human-in-the-Loop ────────────────────────────────────────
    human_approved: bool          # Did the human approve the optimization?
    human_feedback: str           # Optional feedback from human reviewer
