import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ANON_KEY")

supabase: Client = create_client(url, key)

# Mock data to migrate
mock_records = [
    {
        "created_at": "2026-04-20T10:00:00Z",
        "query": "Best luxury hotel in KL with a view of Petronas",
        "hotel_url": "https://www.mandarinoriental.com/kl",
        "hotel_name": "Mandarin Oriental Kuala Lumpur",
        "baseline_score": 42,
        "optimized_score": 68,
        "delta": 26,
        "reasoning": "Missing machine-readable pricing schemas and location relevance markers.",
        "original_profile": {},
        "optimized_profile": {},
        "sources": ["https://www.mandarinoriental.com/kl"]
    },
    {
        "created_at": "2026-04-21T14:30:00Z",
        "query": "Family resort near city center with pool",
        "hotel_url": "https://www.fourseasons.com/kl",
        "hotel_name": "Four Seasons Hotel Kuala Lumpur",
        "baseline_score": 38,
        "optimized_score": 71,
        "delta": 33,
        "reasoning": "Amenity tags were inconsistent with agentic extraction patterns.",
        "original_profile": {},
        "optimized_profile": {},
        "sources": ["https://www.fourseasons.com/kl"]
    },
    {
        "created_at": "2026-04-22T09:15:00Z",
        "query": "Corporate stay with high-speed fiber",
        "hotel_url": "https://www.eqkualalumpur.com/",
        "hotel_name": "EQ Kuala Lumpur",
        "baseline_score": 55,
        "optimized_score": 74,
        "delta": 19,
        "reasoning": "Optimized technical specifications for better LLM context retrieval.",
        "original_profile": {},
        "optimized_profile": {},
        "sources": ["https://www.eqkualalumpur.com/"]
    }
]

def migrate():
    print(f"Starting migration to {url}...")
    try:
        # Check if table exists by trying a select
        supabase.table("optimization_records").select("id").limit(1).execute()
        
        # Insert records
        for record in mock_records:
            print(f"   Migrating: {record['hotel_name']}...")
            supabase.table("optimization_records").insert(record).execute()
            
        print("Migration complete! All mock records moved to Supabase.")
    except Exception as e:
        print(f"Migration failed: {e}")
        print("\nTIP: Make sure you ran the SQL schema in the Supabase SQL Editor first!")

if __name__ == "__main__":
    migrate()
