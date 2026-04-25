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

def save_optimization_record(data: dict):
    """
    Saves an optimization record to Supabase.
    Accepts either a pre-formatted record dict (from API endpoint)
    or a raw pipeline state dict.
    """
    if not supabase:
        print("   [Supabase] Skip saving: Client not initialized")
        return None
        
    try:
        # If data already has 'query' key, it's a pre-formatted record from the API
        if "query" in data:
            record = {
                "query": data.get("query", ""),
                "hotel_url": data.get("hotel_url", ""),
                "hotel_name": data.get("hotel_name", "Unknown"),
                "baseline_score": data.get("baseline_score", 0),
                "optimized_score": data.get("optimized_score", 0),
                "delta": data.get("delta", 0),
                "reasoning": data.get("reasoning", ""),
                "original_profile": data.get("original_profile", {}),
                "optimized_profile": data.get("optimized_profile", {}),
                "sources": data.get("sources", [])
            }
        else:
            # Legacy: raw pipeline state
            record = {
                "query": data.get("traveller_query", ""),
                "hotel_url": data.get("hotel_url", ""),
                "hotel_name": data.get("aggregated_profile", {}).get("name", "Unknown"),
                "baseline_score": data.get("evaluation_score", 0),
                "optimized_score": data.get("resim_score", 0),
                "delta": data.get("score_delta", 0),
                "reasoning": data.get("resim_reasoning", ""),
                "original_profile": data.get("aggregated_profile", {}),
                "optimized_profile": data.get("optimized_profile", {}),
                "sources": data.get("sources", [])
            }
        
        print(f"   [Supabase] Archiving record for {record['hotel_name']}...")
        result = supabase.table("optimization_records").insert(record).execute()
        print(f"   [Supabase] Record saved successfully. ID: {result.data[0]['id']}")
        return result.data[0]
        
    except Exception as e:
        print(f"   [Supabase] Error saving record: {e}")
        return None
