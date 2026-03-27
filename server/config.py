import os
from typing import Dict, List
from model import ChatMessage

TOKEN = os.getenv("HF_TOKEN") or "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"
SUPPORTED_MODELS: Dict[str, str] = {
	"qwen2.5-1.5b-instruct": "Qwen/Qwen2.5-1.5B-Instruct",
	"qwen2.5-coder-1.5b-instruct": "Qwen/Qwen2.5-Coder-1.5B-Instruct",
}
DEFAULT_MODEL_ID = "qwen2.5-1.5b-instruct"

DATA_DIR = os.getenv("DATA_DIR", "/data")
MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(DATA_DIR, "models"))
HISTORY_FILE = os.getenv("HISTORY_FILE", os.path.join(DATA_DIR, "chat_history.json"))

sessions: Dict[str, Dict[str, List[ChatMessage]]] = {}
session_started_at: Dict[str, Dict[str, str]] = {}

ssl_key=os.getenv("SSL_KEY")
ssl_cert=os.getenv("SSL_CERT")