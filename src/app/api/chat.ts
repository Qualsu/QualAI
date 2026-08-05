import { apiClient } from "@/app/api/client";
import type {
  AccountRequest,
  AllHistoryResponse,
  AvailableModelsResponse,
  ChatRequest,
  ChatResponse,
  ClearSessionResponse,
  SessionHistoryResponse,
  SessionRequest,
} from "@/app/api/types";

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat", payload, {
    timeout: 180000,
  });
  return data;
}

export async function sendChatMessageStream(
  payload: ChatRequest,
  onInit: (data: { session_id: string; model_id: string }) => void,
  onToken: (chunk: string) => void
): Promise<{ session_id: string; model_id: string }> {
  const baseURL = process.env.NEXT_PUBLIC_API;
  if (!baseURL) {
    throw new Error("NEXT_PUBLIC_API is not defined");
  }

  const response = await fetch(`${baseURL.replace(/\/$/, "")}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let sessionInfo = {
    session_id: payload.session_id || "",
    model_id: payload.model_id || "",
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, "");
      try {
        const data = JSON.parse(jsonStr);
        if (data.type === "init") {
          sessionInfo = { session_id: data.session_id, model_id: data.model_id };
          onInit(sessionInfo);
        } else if (data.type === "token") {
          onToken(data.content);
        } else if (data.type === "done") {
          sessionInfo = { session_id: data.session_id, model_id: data.model_id };
        } else if (data.type === "error") {
          throw new Error(data.detail || "Stream error");
        }
      } catch (err) {
        if (err instanceof Error && err.message === "Stream error") {
          throw err;
        }
      }
    }
  }

  return sessionInfo;
}

export async function fetchSessionHistory(
  payload: SessionRequest,
): Promise<SessionHistoryResponse> {
  const { data } = await apiClient.post<SessionHistoryResponse>(
    "/history/session",
    payload,
  );
  return data;
}

export async function fetchAllHistory(payload: AccountRequest): Promise<AllHistoryResponse> {
  const { data } = await apiClient.post<AllHistoryResponse>("/history/all", payload);
  return data;
}

export async function clearChatSession(payload: SessionRequest): Promise<ClearSessionResponse> {
  const { data } = await apiClient.post<ClearSessionResponse>("/chat/clear", payload);
  return data;
}

export async function fetchAvailableModels(): Promise<AvailableModelsResponse> {
  const { data } = await apiClient.get<AvailableModelsResponse>("/models");
  return data;
}
