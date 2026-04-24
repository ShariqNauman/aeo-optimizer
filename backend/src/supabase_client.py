import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = None

if url and key:
    try:
        supabase = create_client(url, key)
        print(f"   [Supabase] Client initialized for {url}")
    except Exception as e:
        print(f"   [Supabase] Failed to initialize client: {e}")

def save_optimization_record(state: dict):
    """
    Saves the final state of an optimization run to Supabase.
    """
    if not supabase:
        print("   [Supabase] Skip saving: Client not initialized")
        return
        
    try:
        # Extract data from state
        # Note: state keys match AEOState TypedDict
        record = {
            "query": state.get("traveller_query", ""),
            "hotel_url": state.get("hotel_url", ""),
            "hotel_name": state.get("aggregated_profile", {}).get("name", "Unknown"),
            "baseline_score": state.get("evaluation_score", 0),
            "optimized_score": state.get("resim_score", 0),
            "delta": state.get("score_delta", 0),
            "reasoning": state.get("resim_reasoning", ""),
            "original_profile": state.get("aggregated_profile", {}),
            "optimized_profile": state.get("optimized_profile", {}),
            "sources": state.get("sources", [])
        }
        
        print(f"   [Supabase] Archiving record for {record['hotel_name']}...")
        result = supabase.table("optimization_records").insert(record).execute()
        print(f"   [Supabase] Record saved successfully. ID: {result.data[0]['id']}")
        return result.data[0]
        
    except Exception as e:
        print(f"   [Supabase] Error saving record: {e}")
        return None
