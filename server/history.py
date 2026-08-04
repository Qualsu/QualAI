import json
import os
from typing import Dict, List
from motor.motor_asyncio import AsyncIOMotorClient
from motor.core import AgnosticCollection

from model import *
from config import DEFAULT_MODEL_ID, session_started_at, sessions, VOICY_DB

def get_collection() -> AgnosticCollection | None:
    if not VOICY_DB:
        return None
    try:
        client = AsyncIOMotorClient(VOICY_DB)
        db = client.get_default_database(default="qual_ai")
        return db["history"]
    except Exception as e:
        print(f"MongoDB connection error: {e}")
        return None

def normalize_history(history: object) -> List[ChatMessage]:
    if not isinstance(history, list):
        return []

    normalized_history: List[ChatMessage] = []
    for item in history:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        model_id = item.get("model_id")
        if isinstance(role, str) and isinstance(content, str):
            role_text = role.strip()
            content_text = content.strip()
            model_id_text = model_id.strip() if isinstance(model_id, str) else None
            if role_text and content_text:
                normalized_history.append(
                    ChatMessage(role=role_text, content=content_text, model_id=model_id_text)
                )

    return normalized_history

async def load_history_from_disk() -> Dict[str, Dict[str, List[ChatMessage]]]:
    collection = get_collection()
    if collection is None:
        return {}

    normalized: Dict[str, Dict[str, List[ChatMessage]]] = {}
    normalized_started_at: Dict[str, Dict[str, str]] = {}

    try:
        cursor = collection.find()
        async for doc in cursor:
            account_id = doc.get("account_id")
            session_id = doc.get("session_id")
            created_at = doc.get("created_at", "")
            messages = doc.get("history", [])

            if not account_id or not session_id:
                continue
                
            history = normalize_history(messages)

            if account_id not in normalized:
                normalized[account_id] = {}
                normalized_started_at[account_id] = {}
                
            normalized[account_id][session_id] = history
            normalized_started_at[account_id][session_id] = created_at

        session_started_at.clear()
        session_started_at.update(normalized_started_at)
    except Exception as e:
        print(f"Error loading from MongoDB: {e}")

    return normalized

async def save_session_to_disk(account_id: str, session_id: str) -> None:
    collection = get_collection()
    if collection is None:
        return
        
    created_at = session_started_at.get(account_id, {}).get(session_id, "")
    history = sessions.get(account_id, {}).get(session_id, [])
    history_dicts = [message.model_dump() for message in history]
    
    try:
        await collection.update_one(
            {"account_id": account_id, "session_id": session_id},
            {"$set": {
                "account_id": account_id,
                "session_id": session_id,
                "created_at": created_at,
                "history": history_dicts
            }},
            upsert=True
        )
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")

async def delete_session_from_disk(account_id: str, session_id: str) -> None:
    collection = get_collection()
    if collection is None:
        return
        
    try:
        await collection.delete_one({"account_id": account_id, "session_id": session_id})
    except Exception as e:
        print(f"Error deleting from MongoDB: {e}")

# Maintain backward compatibility if any other code uses it
async def save_history_to_disk() -> None:
    pass