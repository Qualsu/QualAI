from config import HISTORY_FILE
import json
import os
from typing import Dict, List
from model import *
from config import sessions

def normalize_history(history: object) -> List[ChatMessage]:
    if not isinstance(history, list):
        return []

    normalized_history: List[ChatMessage] = []
    for item in history:
        if not isinstance(item, dict):
            continue
        role = item.get("role")
        content = item.get("content")
        if isinstance(role, str) and isinstance(content, str):
            role_text = role.strip()
            content_text = content.strip()
            if role_text and content_text:
                normalized_history.append(ChatMessage(role=role_text, content=content_text))

    return normalized_history


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
        for session_id, history in account_data.items():
            if not isinstance(session_id, str):
                continue
            normalized_account_sessions[session_id] = normalize_history(history)

        normalized[account_id] = normalized_account_sessions

    if legacy_sessions:
        normalized.setdefault("default", {}).update(legacy_sessions)

    return normalized


def save_history_to_disk() -> None:
    temp_file = f"{HISTORY_FILE}.tmp"
    serializable_sessions = {
        account_id: {
            session_id: [message.model_dump() for message in history]
            for session_id, history in account_sessions.items()
        }
        for account_id, account_sessions in sessions.items()
    }
    with open(temp_file, "w", encoding="utf-8") as file:
        json.dump(serializable_sessions, file, ensure_ascii=False, indent=2)
    os.replace(temp_file, HISTORY_FILE)