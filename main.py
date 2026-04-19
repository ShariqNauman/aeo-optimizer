"""
AEO Optimizer - CLI Entry Point
=================================
This is the main script you run from the terminal.

Usage:
    python main.py

What it does:
    1. Builds the LangGraph pipeline (all agents wired together)
    2. Creates an initial state with sample hotel data
    3. Runs the full pipeline
    4. Prints the final state (results from every agent)

Right now (Phase 2), all agents are STUBS — they just print their name
and return dummy data. Starting from Phase 3, we'll replace them one
by one with real LLM-powered agents.
"""

from src.graph import build_graph


def main():
    print("=" * 60)
    print("  AEO Optimizer - Multi-Agent Pipeline")
    print("  Phase 2: Graph Skeleton (Stub Nodes)")
    print("=" * 60)
    
    # ── Step 1: Build the graph ──
    print("\n[Setup] Building LangGraph pipeline...")
    graph = build_graph()
    print("[Setup] Graph compiled successfully!\n")
    
    # ── Step 2: Define the initial state ──
    initial_state = {
        "hotel_name_or_url": "The Grand Palace Hotel Kuala Lumpur",
        "traveller_query": "luxury family hotel in Kuala Lumpur with pool",
    }
    
    print("-" * 60)
    print("RUNNING PIPELINE")
    print("-" * 60)
    
    # ── Step 3: Invoke the graph ──
    final_state = graph.invoke(initial_state)
    
    # ── Step 4: Display results ──
    print("\n" + "=" * 60)
    print("PIPELINE COMPLETE - Final State Summary")
    print("=" * 60)
    
    print(f"\n  Hotel/URL:           {final_state.get('hotel_name_or_url')}")
    print(f"  Query:              {final_state.get('traveller_query')}")
    print(f"  Sources Found:      {len(final_state.get('sources', []))}")
    print(f"  Evaluation Score:   {final_state.get('evaluation_score')}/100")
    print(f"  Reasoning:          {final_state.get('evaluation_reasoning')}")
    print(f"  Gaps Found:         {len(final_state.get('gaps', []))}")
    print(f"  Validation Passed:  {final_state.get('validation_passed')}")
    print(f"  Human Approved:     {final_state.get('human_approved')}")
    print(f"  Re-sim Score:       {final_state.get('resim_score')}/100")
    print(f"  Score Delta:        +{final_state.get('score_delta')} points")
    
    print("\n" + "=" * 60)
    print("  All stub nodes executed successfully!")
    print("  Next: Phase 3 will replace Agent 1 with real LLM logic.")
    print("=" * 60)


if __name__ == "__main__":
    main()
