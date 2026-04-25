import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.graph import build_graph
from src.agents.discovery_agent import discover_hotels, validate_query
from src.supabase_client import save_optimization_record
import traceback

app = FastAPI(title="AEO Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()

# ── Pydantic models for Discovery ─────────────────────────────────────
class SearchRequest(BaseModel):
    query: str

class HotelResult(BaseModel):
    name: str
    url: str

class SearchResponse(BaseModel):
    hotels: list[HotelResult]
    is_valid: bool = True
    error_message: str | None = None

# ── Endpoints ─────────────────────────────────────────────────────────

@app.post("/api/search_hotels", response_model=SearchResponse)
async def search_hotels(request: SearchRequest):
    """
    Endpoint to discover hotels based on a natural language query.
    First validates the query using AI to handle edge cases.
    """
    # 1. AI Validation
    validation = validate_query(request.query)
    
    if not validation.is_valid:
        return {
            "hotels": [],
            "is_valid": False,
            "error_message": validation.reason
        }
    
    # 2. Discovery (using suggested query if provided)
    query_to_use = validation.suggested_query if validation.suggested_query else request.query
    results = discover_hotels(query_to_use)
    
    return {
        "hotels": results,
        "is_valid": True,
        "error_message": None
    }

@app.websocket("/ws/optimize")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        data = await websocket.receive_text()
        payload = json.loads(data)
        
        initial_state = {
            "hotel_url": payload.get("hotel_url", ""),
            "traveller_query": payload.get("traveller_query", ""),
        }
        
        await websocket.send_json({
            "type": "system", 
            "message": "Pipeline started", 
            "status": "running"
        })
        
        final_accumulated_state = initial_state.copy()
        
        async for output in graph.astream(initial_state, stream_mode="updates"):
            if isinstance(output, dict):
                for node_name, state_update in output.items():
                    # Accumulate state for DB saving
                    if state_update:
                        final_accumulated_state.update(state_update)
                    
                    try:
                        await websocket.send_json({
                            "type": "agent_update",
                            "agent": node_name,
                            "data": state_update
                        })
                        # Allow the WebSocket to flush
                        await asyncio.sleep(0.01)
                    except Exception as send_err:
                        print(f"Error sending update: {send_err}")
        
        # Send final accumulated state to frontend for explicit save
        await websocket.send_json({
            "type": "system",
            "message": "Pipeline completed",
            "status": "complete",
            "final_state": {
                "traveller_query": final_accumulated_state.get("traveller_query", ""),
                "hotel_url": final_accumulated_state.get("hotel_url", ""),
                "hotel_name": final_accumulated_state.get("aggregated_profile", {}).get("name", "Unknown"),
                "baseline_score": final_accumulated_state.get("evaluation_score", 0),
                "optimized_score": final_accumulated_state.get("resim_score", 0),
                "delta": final_accumulated_state.get("score_delta", 0),
                "reasoning": final_accumulated_state.get("resim_feedback", ""),
                "original_profile": final_accumulated_state.get("aggregated_profile", {}),
                "optimized_profile": final_accumulated_state.get("optimized_profile", {}),
                "sources": final_accumulated_state.get("sources", []),
            }
        })
        
    except WebSocketDisconnect:
        print("Frontend disconnected.")
    except Exception as e:
        error_type = type(e).__name__
        error_msg = f"[{error_type}] {str(e)}"
        stack_trace = traceback.format_exc()
        
        print(f"\n!!! [CRITICAL ERROR] Pipeline crashed:")
        print(f"    Type: {error_type}")
        print(f"    Message: {str(e)}")
        print(f"    Stack Trace:\n{stack_trace}")
        
        try:
            await websocket.send_json({
                "type": "error",
                "message": error_msg,
                "agent": "system"
            })
        except Exception as send_err:
            print(f"Could not send error to frontend: {send_err}")

# ── Explicit Save Endpoint ─────────────────────────────────────────────

class SaveRecordRequest(BaseModel):
    traveller_query: str = ""
    hotel_url: str = ""
    hotel_name: str = "Unknown"
    baseline_score: int = 0
    optimized_score: int = 0
    delta: int = 0
    reasoning: str = ""
    original_profile: dict = {}
    optimized_profile: dict = {}
    sources: list = []

@app.post("/api/save_record")
async def save_record(request: SaveRecordRequest):
    """
    Explicitly saves an optimization record to Supabase.
    Only called when the user clicks 'Save to Database'.
    """
    try:
        record = {
            "query": request.traveller_query,
            "hotel_url": request.hotel_url,
            "hotel_name": request.hotel_name,
            "baseline_score": request.baseline_score,
            "optimized_score": request.optimized_score,
            "delta": request.delta,
            "reasoning": request.reasoning,
            "original_profile": request.original_profile,
            "optimized_profile": request.optimized_profile,
            "sources": request.sources,
        }
        result = save_optimization_record(record)
        if result:
            return {"success": True, "id": result.get("id")}
        return {"success": False, "error": "Failed to save record"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
