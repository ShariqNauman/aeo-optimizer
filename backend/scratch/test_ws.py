import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8000/ws/optimize"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to WebSocket")
            await websocket.send(json.dumps({
                "hotel_url": "test_url",
                "traveller_query": "test_query"
            }))
            print("Sent payload")
            
            while True:
                response = await websocket.recv()
                print(f"Received: {response}")
                data = json.loads(response)
                if data.get("status") == "complete" or data.get("type") == "error":
                    break
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
