from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    model_id: Optional[str] = Field(default=None, min_length=1)


class AccountRequest(BaseModel):
    account_id: str = Field(..., min_length=1)


class SessionRequest(AccountRequest):
    session_id: str = Field(..., min_length=1)
    model_id: Optional[str] = Field(default=None, min_length=1)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    account_id: str = Field(..., min_length=1)
    session_id: Optional[str] = None
    model_id: Optional[str] = Field(default=None, min_length=1)
    max_history_turns: Optional[int] = Field(default=None, ge=1, le=20)


class ChatResponse(BaseModel):
    account_id: str
    session_id: str
    model_id: str
    response: str
    history: List[ChatMessage]


class SessionHistoryResponse(BaseModel):
    account_id: str
    session_id: str
    model_id: str
    history: List[ChatMessage]


class AllHistoryResponse(BaseModel):
    account_id: str
    sessions: Dict[str, List[ChatMessage]]
    session_started_at: Dict[str, str]


class AvailableModelsResponse(BaseModel):
    default_model_id: str
    models: Dict[str, str]


class ClearSessionResponse(BaseModel):
    status: Literal["cleared"]
    account_id: str
    session_id: str