from contextlib import asynccontextmanager
from datetime import datetime, timezone
from threading import Lock
from typing import Dict
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from hf_model import HFChatModel
from model import *
from config import *
from history import load_history_from_disk, save_history_to_disk

chat_model = HFChatModel()
session_lock = Lock()

@asynccontextmanager
async def lifespan(_app: FastAPI):
    with session_lock:
        sessions.update(load_history_from_disk())
    chat_model.warmup_default()
    yield


app = FastAPI(title="Qual AI Model API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/models", response_model=AvailableModelsResponse)
def get_available_models() -> AvailableModelsResponse:
    return AvailableModelsResponse(
        default_model_id=chat_model.default_model_id,
        models=chat_model.get_available_models(),
    )


def resolve_session_model_id(history: list[ChatMessage]) -> str:
    for message in reversed(history):
        if message.role == "assistant" and message.model_id:
            return message.model_id
    return chat_model.default_model_id


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message must not be empty")

    account_id = request.account_id.strip()
    if not account_id:
        raise HTTPException(status_code=400, detail="account_id must not be empty")

    try:
        model_id = chat_model.resolve_model_id(request.model_id)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    session_id = request.session_id or str(uuid4())
    started_at_iso = datetime.now(timezone.utc).isoformat()

    with session_lock:
        history = list(sessions.get(account_id, {}).get(session_id, []))
        account_started = session_started_at.setdefault(account_id, {})
        account_started.setdefault(session_id, started_at_iso)

    history.append(ChatMessage(role="user", content=request.message.strip()))

    try:
        model_history = [message.model_dump() for message in history]
        reply = chat_model.generate_from_messages(
            model_history,
            max_history_turns=request.max_history_turns,
            model_id=model_id,
        )
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    history.append(ChatMessage(role="assistant", content=reply, model_id=model_id))

    history_turns = request.max_history_turns or chat_model.max_history_turns
    history = history[-history_turns * 2 :]

    with session_lock:
        sessions.setdefault(account_id, {})[session_id] = history
        save_history_to_disk()

    return ChatResponse(
        account_id=account_id,
        session_id=session_id,
        model_id=model_id,
        response=reply,
        history=history,
    )


@app.post("/history/session", response_model=SessionHistoryResponse)
def get_session_history(request: SessionRequest) -> SessionHistoryResponse:
    account_id = request.account_id.strip()
    session_id = request.session_id.strip()

    with session_lock:
        history = sessions.get(account_id, {}).get(session_id)

    if history is None:
        raise HTTPException(status_code=404, detail="Session not found")

    model_id = resolve_session_model_id(history)

    return SessionHistoryResponse(
        account_id=account_id,
        session_id=session_id,
        model_id=model_id,
        history=history,
    )


@app.post("/history/all", response_model=AllHistoryResponse)
def get_all_history(request: AccountRequest) -> AllHistoryResponse:
    account_id = request.account_id.strip()

    with session_lock:
        account_sessions = sessions.get(account_id, {})
        account_started = session_started_at.get(account_id, {})

        ordered_session_ids = sorted(
            account_sessions.keys(),
            key=lambda session_id: account_started.get(session_id, ""),
            reverse=True,
        )

        all_sessions = {
            session_id: account_sessions[session_id]
            for session_id in ordered_session_ids
        }

        all_started_at = {
            session_id: account_started.get(session_id, "")
            for session_id in ordered_session_ids
        }

    return AllHistoryResponse(
        account_id=account_id,
        sessions=all_sessions,
        session_started_at=all_started_at,
    )


@app.post("/chat/clear", response_model=ClearSessionResponse)
def clear_session(request: SessionRequest) -> ClearSessionResponse:
    account_id = request.account_id.strip()
    session_id = request.session_id.strip()

    with session_lock:
        account_sessions = sessions.get(account_id)
        if account_sessions is not None:
            account_sessions.pop(session_id, None)
            if not account_sessions:
                sessions.pop(account_id, None)
        account_started = session_started_at.get(account_id)
        if account_started is not None:
            account_started.pop(session_id, None)
            if not account_started:
                session_started_at.pop(account_id, None)
        save_history_to_disk()
    return ClearSessionResponse(status="cleared", account_id=account_id, session_id=session_id)


if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8006,
        reload=True,
        headers=[("server", "Qualsu")],
        ssl_keyfile=None if os.name == 'nt' else ssl_key,
        ssl_certfile=None if os.name == 'nt' else ssl_cert
    )
