from langgraph.graph import StateGraph, START, END
from src.state import AEOState
from src.agents.web_researcher import web_researcher
from src.agents.data_aggregation import data_aggregation
from src.agents.ai_simulator import ai_simulator
from src.agents.gap_analyzer import gap_analyzer


# ── Stub Node Functions ───────────────────────────────────────────────
# Remaining stubs will be replaced in later phases.
# Real agents: Web Researcher, Data Aggregation, AI Simulator, Gap Analyzer.
# ──────────────────────────────────────────────────────────────────────

def input_handler(state: AEOState) -> dict:
    """
    Input Handler (Node 0)
    Validates and prepares the input data.
    """
    print("\n>> [Input Handler] Received input")
    print(f"   Hotel URL: {state.get('hotel_url', 'N/A')}")
    print(f"   Query:     {state.get('traveller_query', 'N/A')}")
    return {}


# ai_simulator and gap_analyzer are imported from src.agents above.


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
              -> Re-simulator -> Human Approval -> END
    
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
    workflow.add_edge("validator", "resimulator")
    workflow.add_edge("resimulator", "human_approval")       
    workflow.add_edge("human_approval", END)
    
    # ── Compile the graph ──
    graph = workflow.compile()
    
    return graph
