from __future__ import annotations

import os
from typing import Any, Dict, List, TYPE_CHECKING

if TYPE_CHECKING:
    from model import ChatMessage



OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://192.168.0.150:11434")

SUPPORTED_MODELS: Dict[str, str] = {
	"qwen3:1.7b": "QualAI-2",
	"qwen3:0.6b": "QualAI-2-mini",
	"qwen2.5-coder:1.5b": "QualAI-Code",
	"qwen2.5-coder:3b": "QualAI-Code-Max",
	"qwen2.5:1.5b": "QualAI-1",
	"qwen2.5:0.5b": "QualAI-1-mini",
}
DEFAULT_MODEL_ID = "qwen3:1.7b"

DATA_DIR = os.getenv("DATA_DIR", "/data")
MODELS_DIR = os.getenv("MODELS_DIR", os.path.join(DATA_DIR, "models"))
VOICY_DB = os.getenv("VOICY_DB")

sessions: Dict[str, Dict[str, List[ChatMessage]]] = {}
session_started_at: Dict[str, Dict[str, str]] = {}

ssl_key=os.getenv("SSL_KEY")
ssl_cert=os.getenv("SSL_CERT")