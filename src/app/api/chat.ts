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
} from "@/config/types";

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  try {
    const { data } = await apiClient.post<ChatResponse>("/chat", payload, {
      timeout: 180000,
    });
    return data;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const resp = (error as { response?: { status?: number; data?: { detail?: string } } }).response;
      if (resp?.data?.detail) {
        throw new Error(resp.data.detail);
      }
      if (resp?.status === 503) {
        throw new Error("Сервер перегружен (503). В очереди уже максимальное количество запросов. Попробуйте позже.");
      }
      if (resp?.status === 429) {
        throw new Error("Слишком много запросов (429). Лимит: 10 запросов в минуту. Пожалуйста, подождите.");
      }
      if (resp?.status === 504) {
        throw new Error("Превышено время ожидания ответа от модели (120 сек).");
      }
    }
    throw error;
  }
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
    let errorDetail = "";
    try {
      const errorJson = await response.json();
      if (typeof errorJson?.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson?.detail)) {
        errorDetail = errorJson.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ");
      }
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        // ignore
      }
    }

    if (errorDetail) {
      throw new Error(errorDetail);
    }

    if (response.status === 503) {
      throw new Error("Сервер перегружен (503). В очереди уже максимальное количество запросов. Попробуйте чуть позже.");
    }
    if (response.status === 429) {
      throw new Error("Слишком много запросов (429). Лимит: 10 запросов в минуту. Пожалуйста, подождите.");
    }
    if (response.status === 504) {
      throw new Error("Превышено время ожидания генерации ответа (120 сек).");
    }
    throw new Error(`Ошибка запроса к серверу (${response.status})`);
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
          throw new Error(data.detail || "Произошла ошибка при генерации ответа");
        }
      } catch (err) {
        if (err instanceof Error) {
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
