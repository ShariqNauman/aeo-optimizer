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
    print("  Phase 4: AI Simulator + Gap Analyzer")
    print("=" * 60)
    
    # ── Step 1: Build the graph ──
    print("\n[Setup] Building LangGraph pipeline...")
    graph = build_graph()
    print("[Setup] Graph compiled successfully!\n")
    
    # ── Step 2: Define the initial state ──
    initial_state = {
        "hotel_url": "https://www.hilton.com/en/hotels/kulhihi-hilton-kuala-lumpur/",
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
    print(f"\n  Hotel URL:          {final_state.get('hotel_url')}")
    print(f"  Query:              {final_state.get('traveller_query')}")
    print(f"  Sources Found:      {len(final_state.get('sources', []))}")
    
    for i, src in enumerate(final_state.get("sources", []), 1):
        print(f"    [{i}] {src[:80]}")
    
    # Show aggregated profile (compact)
    profile = final_state.get("aggregated_profile", {})
    if profile and "error" not in profile:
        print(f"\n  --- Aggregated Hotel Profile ---")
        print(f"  Name:          {profile.get('name', 'N/A')}")
        print(f"  Location:      {profile.get('location', 'N/A')}")
        print(f"  Star Rating:   {profile.get('star_rating', 'N/A')}")
        print(f"  Amenities:     {len(profile.get('amenities', []))} listed")
        print(f"  Room Types:    {len(profile.get('room_types', []))} listed")
        print(f"  Dining:        {len(profile.get('dining_options', []))} listed")
    
    # Show AI Simulation results
    print(f"\n  --- AI Simulation (Agent 2) ---")
    print(f"  Overall Score:     {final_state.get('evaluation_score', 'N/A')}/100")
    sub = final_state.get("sub_scores", {})
    if sub:
        print(f"    Relevance:       {sub.get('relevance', '?')}/20")
        print(f"    Completeness:    {sub.get('completeness', '?')}/20")
        print(f"    Trust Signals:   {sub.get('trust_signals', '?')}/20")
        print(f"    Value Prop:      {sub.get('value_proposition', '?')}/20")
        print(f"    Structured Data: {sub.get('structured_data_quality', '?')}/20")
    reasoning = final_state.get("evaluation_reasoning", "")
    if reasoning:
        print(f"  Reasoning:         {reasoning[:150]}...")
    
    # Show Gap Analysis results
    gaps = final_state.get("gaps", [])
    print(f"\n  --- Gap Analysis (Agent 2.5) ---")
    print(f"  Gaps Found:        {len(gaps)}")
    for i, gap in enumerate(gaps, 1):
        sev = gap.get("severity", "?").upper()
        cat = gap.get("category", "?")
        desc = gap.get("description", "?")[:80]
        fix = gap.get("suggested_improvement", "")[:80]
        pts = gap.get("estimated_point_gain", "?")
        print(f"  [{i}] [{sev}] {cat}")
        print(f"      Issue: {desc}")
        print(f"      Fix:   {fix}")
        print(f"      Points: +{pts}")
    
    # Show Validation & Optimization results
    print(f"\n  --- Optimization & Validation (Agents 3 & 4) ---")
    print(f"  Validation Passed: {final_state.get('validation_passed', 'N/A')}")
    val_fb = final_state.get('validation_feedback', '')
    if val_fb:
        print(f"  Feedback:          {val_fb[:150]}...")
    
    opt_profile = final_state.get("optimized_profile", {})
    if opt_profile:
        print(f"  Optimized Profile: Generated successfully")
        print(f"  New USPs:          {len(opt_profile.get('unique_selling_points', []))} listed")
        print(f"  New Amenities:     {len(opt_profile.get('amenities', []))} listed")
    print(f"  Re-sim Score:       {final_state.get('resim_score')}/100")
    print(f"  Score Delta:        +{final_state.get('score_delta')} points")
    print(f"  Human Approved:     {final_state.get('human_approved')}")
    
    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
