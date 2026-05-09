from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.runtime import runtime

router = APIRouter()


@router.websocket("/ws/vitals")
async def vitals_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    queue = await runtime.subscribe()
    try:
        if runtime.history:
            await websocket.send_json(runtime.history[-1].model_dump(mode="json", by_alias=True))
        while True:
            payload = await queue.get()
            await websocket.send_json(payload.model_dump(mode="json", by_alias=True))
    except WebSocketDisconnect:
        runtime.unsubscribe(queue)
    finally:
        runtime.unsubscribe(queue)
