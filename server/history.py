from config import HISTORY_FILE
import json
import os
from typing import Dict, List
from model import *
from config import DEFAULT_MODEL_ID, session_started_at, sessions

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


def pick_unified_history(session_data: object) -> List[ChatMessage]:
    if isinstance(session_data, list):
        return normalize_history(session_data)

    if not isinstance(session_data, dict):
        return []

    # Compatibility with model-scoped format: {model_id: [messages]}
    if DEFAULT_MODEL_ID in session_data:
        return normalize_history(session_data.get(DEFAULT_MODEL_ID))

    for history in session_data.values():
        normalized = normalize_history(history)
        if normalized:
            return normalized

    return []


def pick_session_created_at(session_data: object) -> str | None:
    if not isinstance(session_data, dict):
        return None

    created_at = session_data.get("created_at")
    if isinstance(created_at, str) and created_at.strip():
        return created_at.strip()

    return None


def load_history_from_disk() -> Dict[str, Dict[str, List[ChatMessage]]]:
    if not os.path.exists(HISTORY_FILE):
        return {}

    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError):
        return {}

    if not isinstance(data, dict):
        return {}

    normalized: Dict[str, Dict[str, List[ChatMessage]]] = {}
    normalized_started_at: Dict[str, Dict[str, str]] = {}
    legacy_sessions: Dict[str, List[ChatMessage]] = {}

    for account_id, account_data in data.items():
        if not isinstance(account_id, str):
            continue

        # Backward compatibility for old format: {session_id: [messages]}
        if isinstance(account_data, list):
            legacy_sessions[account_id] = normalize_history(account_data)
            continue

        if not isinstance(account_data, dict):
            continue

        normalized_account_sessions: Dict[str, List[ChatMessage]] = {}
        normalized_account_started_at: Dict[str, str] = {}
        for session_id, session_data in account_data.items():
            if not isinstance(session_id, str):
                continue

            session_history = pick_unified_history(session_data)
            normalized_account_sessions[session_id] = session_history

            created_at = pick_session_created_at(session_data)
            if created_at is not None:
                normalized_account_started_at[session_id] = created_at

        normalized[account_id] = normalized_account_sessions
        normalized_started_at[account_id] = normalized_account_started_at

    if legacy_sessions:
        normalized.setdefault("default", {})
        for session_id, history in legacy_sessions.items():
            normalized["default"][session_id] = history

    session_started_at.clear()
    session_started_at.update(normalized_started_at)

    return normalized


def save_history_to_disk() -> None:
    history_dir = os.path.dirname(HISTORY_FILE)
    if history_dir:
        os.makedirs(history_dir, exist_ok=True)

    temp_file = f"{HISTORY_FILE}.tmp"
    serializable_sessions = {
        account_id: {
            session_id: {
                "created_at": session_started_at.get(account_id, {}).get(session_id, ""),
                "history": [message.model_dump() for message in history],
            }
            for session_id, history in account_sessions.items()
        }
        for account_id, account_sessions in sessions.items()
    }
    with open(temp_file, "w", encoding="utf-8") as file:
        json.dump(serializable_sessions, file, ensure_ascii=False, indent=2)
    os.replace(temp_file, HISTORY_FILE)