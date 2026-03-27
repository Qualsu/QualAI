# Qwen/Qwen2.5-3B-Instruct
# Qwen/Qwen2.5-1.5B-Instruct
# Qwen2.5-Coder-1.5B-Instruct

import os
from typing import Dict, List
from model import ChatMessage

TOKEN = os.getenv("HF_TOKEN") or "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"
MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
CACHE_DIR = "Z:\script\Python\llamma-ai\hf_cache"
HISTORY_FILE = "chat_history.json"
sessions: Dict[str, Dict[str, List["ChatMessage"]]] = {}