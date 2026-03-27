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
