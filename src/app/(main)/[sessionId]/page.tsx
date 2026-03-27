'use client';

import { fetchAvailableModels, fetchSessionHistory, sendChatMessage } from "@/app/api/chat";
import type { ChatMessage } from "@/app/api/types";
import ChatPageSkeleton from "@/components/chat-page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const CHAT_SESSIONS_UPDATED_EVENT = "chat-sessions-updated";
const MODEL_STORAGE_KEY = "chat-model-id";
const TYPING_PLACEHOLDER = "__typing__";

function getModelLabel(modelId: string): string {
  if (modelId === "qwen2.5-coder-1.5b-instruct") {
    return "QualAI-Codex-1.5B";
  }

  if (modelId === "qwen2.5-1.5b-instruct") {
    return "QualAI-1.5B";
  }

  return modelId;
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 py-1">
      <span
        className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce"
        style={{ animationDelay: "120ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-neutral-300 animate-bounce"
        style={{ animationDelay: "240ms" }}
      />
    </div>
  );
}

function resolveAssistantReply(responseText: string, history: ChatMessage[]): string {
  if (responseText?.trim()) {
    return responseText.trim();
  }

  const lastAssistant = [...history].reverse().find((item) => item.role === "assistant");
  return lastAssistant?.content ?? "";
}

export default function Chat() {
  const { user } = useUser();
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId;

  const [message, setMessage] = useState("");
  const [model, setModel] = useState("qwen2.5-1.5b-instruct");
  const [models, setModels] = useState<Record<string, string>>({
    "qwen2.5-1.5b-instruct": "Qwen/Qwen2.5-1.5B-Instruct",
    "qwen2.5-coder-1.5b-instruct": "Qwen/Qwen2.5-Coder-1.5B-Instruct",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountId = user?.id ?? "guest";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setModel(storedModel);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        const data = await fetchAvailableModels();
        if (!isMounted) {
          return;
        }

        setModels(data.models);
        setModel((prev) => {
          if (prev && data.models[prev]) {
            return prev;
          }
          return data.default_model_id;
        });
      } catch {
        // Keep fallback options.
      }
    };

    void loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && model) {
      window.localStorage.setItem(MODEL_STORAGE_KEY, model);
    }
  }, [model]);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSessionHistory({
          account_id: accountId,
          session_id: sessionId,
        });

        if (isMounted) {
          setMessages(data.history);
          setError(null);
        }
      } catch (error: unknown) {
        if (isMounted) {
          setMessages([]);
          const status =
            typeof error === "object" &&
            error !== null &&
            "response" in error &&
            typeof (error as { response?: unknown }).response === "object" &&
            (error as { response?: { status?: number } }).response?.status;

          if (status === 404) {
            setError(null);
          } else {
            setError("Не удалось загрузить историю этого чата.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [accountId, sessionId]);

  const animateAssistantMessage = async (text: string, modelId?: string) => {
    const targetText = text.trim();
    if (!targetText) {
      setMessages((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "", model_id: modelId };
        return next;
      });
      return;
    }

    await new Promise<void>((resolve) => {
      let position = 0;
      const step = Math.max(1, Math.ceil(targetText.length / 80));
      const intervalId = window.setInterval(() => {
        position = Math.min(position + step, targetText.length);
        const chunk = targetText.slice(0, position);

        setMessages((prev) => {
          if (prev.length === 0) {
            return prev;
          }

          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: chunk, model_id: modelId };
          return next;
        });

        if (position >= targetText.length) {
          window.clearInterval(intervalId);
          resolve();
        }
      }, 22);
    });
  };

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !sessionId || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmedMessage },
      { role: "assistant", content: TYPING_PLACEHOLDER, model_id: model },
    ]);

    try {
      const response = await sendChatMessage({
        account_id: accountId,
        message: trimmedMessage,
        model_id: model,
        session_id: sessionId,
      });

      const assistantReply = resolveAssistantReply(response.response, response.history);
      await animateAssistantMessage(assistantReply, response.model_id);

      setModel(response.model_id);


      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CHAT_SESSIONS_UPDATED_EVENT));
      }
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setError("Не удалось отправить сообщение. Проверь API и попробуй снова.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <ChatPageSkeleton />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col text-neutral-100">
      {/* Выбор модели */}
      <div className="shrink-0 border-b border-neutral-800 p-4">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700 text-neutral-100 hover:bg-neutral-700">
            <SelectValue placeholder="Выберите модель" />
          </SelectTrigger>
          <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
            {Object.keys(models).map((modelId) => (
              <SelectItem key={modelId} value={modelId}>
                {getModelLabel(modelId)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-2">
            <h1 className="text-4xl font-bold text-neutral-100">Чем могу помочь?</h1>
            <p className="text-neutral-400">История чата пока пустая, отправь первое сообщение.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={item.role === "user" ? "ml-auto max-w-[85%]" : "mr-auto max-w-[85%]"}>
                <div className={`mb-1 text-xs ${item.role === "user" ? "text-right text-neutral-400" : "text-neutral-500"}`}>
                  {item.role === "user" ? "Вы" : getModelLabel(item.model_id ?? model)}
                </div>
                <div
                  className={`rounded-lg px-4 py-3 ${
                    item.role === "user" ? "bg-neutral-700" : "bg-neutral-800"
                  }`}
                >
                  {item.role === "assistant" && item.content === TYPING_PLACEHOLDER ? (
                    <TypingDots />
                  ) : (
                    <div className="whitespace-pre-wrap wrap-break-word">{item.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Поле ввода снизу */}
      <div className="shrink-0 border-t border-neutral-800 px-4 pb-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3 items-end pt-4">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Сообщение..."
            disabled={isLoading || isSending || !sessionId}
            className="flex-1 bg-neutral-800 text-neutral-100 px-4 py-3 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-neutral-500"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={isLoading || isSending || !sessionId}
            className="rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100"
          >
            <Send size={20} />
          </Button>
        </div>
        {error && <p className="max-w-4xl mx-auto mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
