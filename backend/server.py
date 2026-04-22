import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from src.graph import build_graph

app = FastAPI(title="AEO Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_graph()

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
        
        async for output in graph.astream(initial_state, stream_mode="updates"):
            if isinstance(output, dict):
                for node_name, state_update in output.items():
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
        
        await websocket.send_json({
            "type": "system",
            "message": "Pipeline completed",
            "status": "complete"
        })
        
    except WebSocketDisconnect:
        print("Frontend disconnected.")
    except Exception as e:
        import traceback
        error_msg = f"Error in WebSocket: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
