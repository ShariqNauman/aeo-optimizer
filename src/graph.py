from langgraph.graph import StateGraph, START, END
from src.state import AEOState


# ── Stub Node Functions ───────────────────────────────────────────────
# Each function receives the full state dict and returns a dict of
# updates to merge back. Returning {} means "change nothing".
#
# In later phases, we'll replace these with real agent logic.
# ──────────────────────────────────────────────────────────────────────

def input_handler(state: AEOState) -> dict:
    """
    Input Handler (Node 0)
    Validates and prepares the input data.
    """
    print("\n>> [Input Handler] Received input")
    print(f"   Hotel/URL: {state.get('hotel_name_or_url', 'N/A')}")
    print(f"   Query:     {state.get('traveller_query', 'N/A')}")
    return {}


def web_researcher(state: AEOState) -> dict:
    """
    Web Researcher Agent
    Scrapes/searches the internet for hotel data from credible sources.
    If a URL is provided, scrapes that page directly.
    If a hotel name is provided, searches the web for relevant information.
    """
    hotel_input = state.get("hotel_name_or_url", "")
    print(f"\n>> [Web Researcher] Researching: {hotel_input}")
    return {
        "raw_hotel_data": {"stub": True, "source": "placeholder data"},
        "sources": ["https://example.com/stub"],
    }


def data_aggregation(state: AEOState) -> dict:
    """
    Agent 1: Data Aggregation
    Structures raw scraped data into a clean, structured hotel profile.
    """
    print("\n>> [Agent 1: Data Aggregation] Processing scraped data...")
    return {"aggregated_profile": state.get("raw_hotel_data", {})}


def ai_simulator(state: AEOState) -> dict:
    """
    Agent 2: AI Decision Simulator
    Simulates an AI travel agent evaluating the hotel.
    """
    print("\n>> [Agent 2: AI Simulator] Evaluating hotel...")
    return {
        "evaluation_score": 50,
        "evaluation_reasoning": "Stub: no real evaluation yet",
        "sub_scores": {
            "relevance": 50,
            "completeness": 50,
            "trust_signals": 50,
            "value_proposition": 50,
            "structured_data_quality": 50,
        },
    }


def gap_analyzer(state: AEOState) -> dict:
    """
    Agent 2.5: Gap Analyzer
    Identifies weaknesses in the hotel profile.
    """
    print("\n>> [Agent 2.5: Gap Analyzer] Identifying gaps...")
    return {
        "gaps": [
            {"category": "stub", "description": "This is a placeholder gap", "severity": "medium"}
        ]
    }


def optimizer(state: AEOState) -> dict:
    """
    Agent 3: Optimization Agent
    Rewrites hotel content to address identified gaps.
    """
    print("\n>> [Agent 3: Optimizer] Generating optimized content...")
    return {"optimized_profile": state.get("aggregated_profile", {})}


def validator(state: AEOState) -> dict:
    """
    Agent 4: Validator Agent
    Checks quality and factual accuracy of optimized content.
    """
    print("\n>> [Agent 4: Validator] Validating optimized content...")
    return {
        "validation_passed": True,
        "validation_feedback": "Stub: auto-passed validation",
    }


def human_approval(state: AEOState) -> dict:
    """
    HITL: Human-in-the-Loop
    Allows human to review and approve/reject optimization.
    """
    print("\n>> [HITL] Awaiting human approval...")
    return {"human_approved": True}


def resimulator(state: AEOState) -> dict:
    """
    Agent 5: Re-simulation Agent
    Re-runs the AI evaluation on the optimized profile.
    """
    print("\n>> [Agent 5: Re-simulator] Re-evaluating optimized profile...")
    original_score = state.get("evaluation_score", 0)
    new_score = min(original_score + 15, 100)
    return {
        "resim_score": new_score,
        "resim_reasoning": "Stub: simulated improvement",
        "score_delta": new_score - original_score,
    }


# ── Build the Graph ──────────────────────────────────────────────────

def build_graph():
    """
    Constructs and compiles the AEO Optimizer LangGraph pipeline.
    
    The flow:
        START -> Input Handler -> Web Researcher -> Data Aggregation
              -> AI Simulator -> Gap Analyzer -> Optimizer -> Validator
              -> Human Approval -> Re-simulator -> END
    
    Returns:
        CompiledGraph: Ready to invoke with .invoke(initial_state)
    """
    workflow = StateGraph(AEOState)
    
    # ── Add all nodes ──
    workflow.add_node("input_handler", input_handler)
    workflow.add_node("web_researcher", web_researcher)
    workflow.add_node("data_aggregation", data_aggregation)
    workflow.add_node("ai_simulator", ai_simulator)
    workflow.add_node("gap_analyzer", gap_analyzer)
    workflow.add_node("optimizer", optimizer)
    workflow.add_node("validator", validator)
    workflow.add_node("human_approval", human_approval)
    workflow.add_node("resimulator", resimulator)
    
    # ── Wire the edges (linear flow for now) ──
    workflow.add_edge(START, "input_handler")
    workflow.add_edge("input_handler", "web_researcher")
    workflow.add_edge("web_researcher", "data_aggregation")
    workflow.add_edge("data_aggregation", "ai_simulator")
    workflow.add_edge("ai_simulator", "gap_analyzer")
    workflow.add_edge("gap_analyzer", "optimizer")
    workflow.add_edge("optimizer", "validator")
    workflow.add_edge("validator", "human_approval")       
    workflow.add_edge("human_approval", "resimulator")
    workflow.add_edge("resimulator", END)
    
    # ── Compile the graph ──
    graph = workflow.compile()
    
    return graph
