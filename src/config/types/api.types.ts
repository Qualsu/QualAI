export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  model_id?: string;
};

export type ChatRequest = {
  account_id: string;
  message: string;
  model_id?: string;
  session_id?: string;
  max_history_turns?: number;
};

export type ChatResponse = {
  account_id: string;
  session_id: string;
  model_id: string;
  response: string;
  history: ChatMessage[];
};

export type SessionRequest = {
  account_id: string;
  session_id: string;
  model_id?: string;
};

export type SessionHistoryResponse = {
  account_id: string;
  session_id: string;
  model_id: string;
  history: ChatMessage[];
};

export type AccountRequest = {
  account_id: string;
};

export type AllHistoryResponse = {
  account_id: string;
  sessions: Record<string, ChatMessage[]>;
  session_started_at: Record<string, string>;
};

export type ClearSessionResponse = {
  status: "cleared";
  account_id: string;
  session_id: string;
};
