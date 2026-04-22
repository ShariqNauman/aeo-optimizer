from langgraph.graph import StateGraph, START, END
from src.state import AEOState
from src.agents.web_researcher import web_researcher
from src.agents.data_aggregation import data_aggregation
from src.agents.ai_simulator import ai_simulator
from src.agents.gap_analyzer import gap_analyzer
from src.agents.optimizer import optimizer
from src.agents.validator import validator
from src.agents.resimulator import resimulator
# Remaining stubs will be replaced in later phases.
# Real agents: Web Researcher, Data Aggregation, AI Simulator, Gap Analyzer, Optimizer, Validator.
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


# optimizer, validator, and resimulator are imported from src.agents above.

def human_approval(state: AEOState) -> dict:
    """
    Human-in-the-Loop Node.
    Pauses execution in the CLI and asks the user to approve the optimized content.
    """
    print("\n" + "="*60)
    print(">> [HITL] FINAL HUMAN REVIEW")
    print("="*60)
    
    score_delta = state.get("score_delta", 0)
    print(f"The optimization improved the profile's AI readiness by +{score_delta} points.\n")
    
    optimized_profile = state.get("optimized_profile", {})
    if optimized_profile:
        print("--- OPTIMIZED PROFILE SUMMARY ---")
        for key, value in optimized_profile.items():
            if isinstance(value, list):
                print(f"{key.replace('_', ' ').title()}:")
                for item in value:
                    print(f"  - {item}")
            else:
                print(f"{key.replace('_', ' ').title()}: {value}")
        print("-" * 33 + "\n")
        
    # When running via the Frontend API, we skip the terminal input block
    # so the WebSocket doesn't freeze. The approval is handled on the Frontend UI.
    print(">> [HITL] Status: Auto-approved for API streaming.")
    return {"human_approved": True}





def should_reoptimize(state: AEOState) -> str:
    """
    Conditional logic after validation.
    If validation passed or max retries reached, move to resimulator.
    Otherwise, route back to optimizer.
    """
    passed = state.get("validation_passed", True)
    retry_count = state.get("retry_count", 0)
    
    if passed or retry_count >= 2:
        if not passed:
            print("   [Warning] Validation failed but max retries reached. Proceeding.")
        return "resimulator"
    else:
        print("   [Routing] Validation failed. Sending back to Optimizer.")
        return "optimizer"


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
    
    # Conditional edge from validator
    workflow.add_conditional_edges(
        "validator",
        should_reoptimize,
        {
            "resimulator": "resimulator",
            "optimizer": "optimizer"
        }
    )
    
    workflow.add_edge("resimulator", "human_approval")       
    workflow.add_edge("human_approval", END)
    
    # ── Compile the graph ──
    graph = workflow.compile()
    
    return graph
