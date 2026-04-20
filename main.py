"""
AEO Optimizer - CLI Entry Point
=================================
Usage:
    python main.py
"""

import json
from dotenv import load_dotenv
load_dotenv()

from src.graph import build_graph


def main():
    print("=" * 60)
    print("  AEO Optimizer - Multi-Agent Pipeline")
    print("  Phase 3: Web Researcher + Data Aggregation")
    print("=" * 60)
    
    # ── Step 1: Build the graph ──
    print("\n[Setup] Building LangGraph pipeline...")
    graph = build_graph()
    print("[Setup] Graph compiled successfully!\n")
    
    # ── Step 2: Define the initial state ──
    # Try with a real hotel name — the Web Researcher will search for it
    initial_state = {
        "hotel_name_or_url": "Hilton Kuala Lumpur",
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
    
    # Input info
    print(f"\n  Hotel/URL:          {final_state.get('hotel_name_or_url')}")
    print(f"  Query:              {final_state.get('traveller_query')}")
    print(f"  Sources Found:      {len(final_state.get('sources', []))}")
    
    # Show sources
    for i, src in enumerate(final_state.get("sources", []), 1):
        print(f"    [{i}] {src[:80]}")
    
    # Show aggregated profile
    profile = final_state.get("aggregated_profile", {})
    if profile and "error" not in profile:
        print(f"\n  --- Aggregated Hotel Profile ---")
        print(f"  Name:          {profile.get('name', 'N/A')}")
        print(f"  Location:      {profile.get('location', 'N/A')}")
        print(f"  Star Rating:   {profile.get('star_rating', 'N/A')}")
        print(f"  Price Range:   {profile.get('price_range', 'N/A')}")
        print(f"  Description:   {profile.get('description', 'N/A')[:100]}...")
        print(f"  Amenities:     {', '.join(profile.get('amenities', []))}")
        print(f"  Room Types:    {', '.join(profile.get('room_types', []))}")
        print(f"  Dining:        {', '.join(profile.get('dining_options', []))}")
        print(f"  USPs:          {', '.join(profile.get('unique_selling_points', []))}")
        print(f"  Nearby:        {', '.join(profile.get('nearby_attractions', []))}")
        print(f"  Reviews:       {profile.get('review_summary', 'N/A')[:100]}...")
        print(f"  Structured:    {profile.get('structured_data_available', 'N/A')}")
    
    # Remaining stub outputs
    print(f"\n  --- Remaining (Stubs) ---")
    print(f"  Evaluation Score:   {final_state.get('evaluation_score')}/100")
    print(f"  Gaps Found:         {len(final_state.get('gaps', []))}")
    print(f"  Validation Passed:  {final_state.get('validation_passed')}")
    print(f"  Human Approved:     {final_state.get('human_approved')}")
    print(f"  Re-sim Score:       {final_state.get('resim_score')}/100")
    print(f"  Score Delta:        +{final_state.get('score_delta')} points")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
