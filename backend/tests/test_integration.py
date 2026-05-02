import pytest
from fastapi.testclient import TestClient
import json
import sys
import os

# Add parent directory to path so we can import server
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the FastAPI app
try:
    from server import app
except ImportError:
    print("Could not import app from server. Make sure you are running this from the correct directory.")
    raise

client = TestClient(app)

def test_validate_url_valid():
    """IT-01: Test URL Validation with a potentially valid URL."""
    print("\n--- Running IT-01: Valid URL Validation ---")
    response = client.post(
        "/api/validate_url",
        json={"url": "https://www.marriott.com"}
    )
    assert response.status_code == 200
    data = response.json()
    print(f"Response: {data}")
    assert "is_valid" in data

def test_validate_url_invalid():
    """IT-02: Test URL Validation with a clearly invalid/hallucinated URL."""
    print("\n--- Running IT-02: Invalid URL Validation ---")
    response = client.post(
        "/api/validate_url",
        json={"url": "not-a-real-url"}
    )
    assert response.status_code == 200
    data = response.json()
    print(f"Response: {data}")
    assert "is_valid" in data

def test_search_hotels():
    """IT-03: Test Hotel Search/Discovery."""
    print("\n--- Running IT-03: Search Hotels ---")
    response = client.post(
        "/api/search_hotels",
        json={"query": "Luxury hotels in Paris"}
    )
    assert response.status_code == 200
    data = response.json()
    print(f"Response (keys): {list(data.keys())}")
    assert "hotels" in data
    assert "is_valid" in data

def test_websocket_optimization():
    """IT-04 & IT-05: Test Optimization Pipeline via WebSocket."""
    print("\n--- Running IT-04 & IT-05: WebSocket Optimization ---")
    try:
        with client.websocket_connect("/ws/optimize") as websocket:
            payload = {
                "hotel_url": "https://example.com/hotel",
                "traveller_query": "A nice stay"
            }
            websocket.send_json(payload)
            
            data = websocket.receive_json()
            print(f"WS First Message: {data}")
            assert data.get("type") == "system"
            assert data.get("status") == "running"
            
            message_count = 0
            while message_count < 3:
                update = websocket.receive_json()
                print(f"WS Update Received: type={update.get('type')}")
                if update.get("type") == "system" and update.get("status") == "complete":
                    print("Pipeline completed successfully.")
                    break
                message_count += 1
                
    except Exception as e:
        pytest.fail(f"WebSocket test failed: {e}")

def test_save_record():
    """IT-06: Test Saving Record to Supabase."""
    print("\n--- Running IT-06: Save Record ---")
    dummy_record = {
        "user_id": "test_user",
        "traveller_query": "Test query",
        "hotel_url": "https://example.com/hotel",
        "hotel_name": "Test Hotel",
        "baseline_score": 50,
        "optimized_score": 90,
        "delta": 40,
        "reasoning": "Test reasoning",
        "original_profile": {"test": True},
        "optimized_profile": {"test": True},
        "sources": [],
        "seo_scores": {"performance": 100},
        "seo_issues": [],
        "optimized_html": "<html></html>"
    }
    
    response = client.post(
        "/api/save_record",
        json=dummy_record
    )
    assert response.status_code == 200
    data = response.json()
    print(f"Response: {data}")
    assert "success" in data

if __name__ == "__main__":
    print("Run this file using: pytest -s tests/test_integration.py")
