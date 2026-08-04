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
  switch (modelId) {
    case "qwen2.5:0.5b":
      return "QualAI-1-mini";
    case "qwen2.5:1.5b":
      return "QualAI-1";
    case "qwen2.5-coder:1.5b":
      return "QualAI-Code";
    case "qwen2.5-coder:3b":
      return "QualAI-Code-Max";
    default:
      if (modelId?.toLowerCase().includes("qwen")) {
        return "QualAI-1";
      }
      return modelId || "QualAI";
  }
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1.5 py-1">
      <span
        className="h-2.5 w-2.5 rounded-full bg-purple-400 animate-bounce shadow-[0_0_8px_rgba(192,132,252,0.8)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-2.5 w-2.5 rounded-full bg-indigo-400 animate-bounce shadow-[0_0_8px_rgba(129,140,248,0.8)]"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_8px_rgba(56,189,248,0.8)]"
        style={{ animationDelay: "300ms" }}
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
  const [model, setModel] = useState("qwen2.5:1.5b");
  const [models, setModels] = useState<Record<string, string>>({
    "qwen2.5:0.5b": "QualAI-1-mini",
    "qwen2.5:1.5b": "QualAI-1",
    "qwen2.5-coder:1.5b": "QualAI-Code",
    "qwen2.5-coder:3b": "QualAI-Code-Max",
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
    <div className="flex h-full min-h-0 flex-col text-white relative isolate">
      {/* Top bar with Model Selector */}
      <header className="shrink-0 border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-[#161118]/80 z-20">
        <div className="flex items-center gap-3">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="surface-panel w-auto min-w-[180px] bg-white/[0.05] hover:bg-white/[0.09] border-white/15 text-white rounded-xl shadow-sm transition-all focus:ring-purple-500/40">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <SelectValue placeholder="Выберите модель" />
              </div>
            </SelectTrigger>
            <SelectContent className="surface-panel bg-[#1e131d]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5">
              {Object.keys(models).map((modelId) => (
                <SelectItem key={modelId} value={modelId} className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span>{getModelLabel(modelId)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* Main message stream */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">История чата пуста</h2>
            <p className="text-white/60 text-sm max-w-sm">Отправь сообщение ниже, чтобы начать диалог с искусственным интеллектом.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={item.role === "user" ? "ml-auto max-w-[85%] sm:max-w-[75%]" : "mr-auto max-w-[90%] sm:max-w-[80%]"}
              >
                <div className={`mb-1.5 text-xs flex items-center gap-1.5 ${item.role === "user" ? "justify-end text-purple-300/80" : "text-white/50"}`}>
                  {item.role === "user" ? (
                    <span>Вы</span>
                  ) : (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                      <span>{getModelLabel(item.model_id ?? model)}</span>
                    </>
                  )}
                </div>
                <div
                  className={`px-5 py-4 ${
                    item.role === "user"
                      ? "bg-gradient-to-br from-purple-600/35 via-purple-700/25 to-indigo-600/35 border border-purple-400/30 text-white rounded-2xl rounded-tr-sm shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-lg"
                      : "surface-panel border-white/10 bg-white/[0.04] text-white/95 rounded-2xl rounded-tl-sm shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
                  }`}
                >
                  {item.role === "assistant" && item.content === TYPING_PLACEHOLDER ? (
                    <TypingDots />
                  ) : (
                    <div className="whitespace-pre-wrap wrap-break-word leading-relaxed">{item.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Input Dock */}
      <footer className="shrink-0 px-4 sm:px-6 pb-6 pt-2 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="surface-panel p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border-white/15 bg-[#191118]/85 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex items-center gap-2 sm:gap-3 transition-all focus-within:border-purple-400/50 focus-within:shadow-[0_20px_60px_rgba(168,85,247,0.15)]">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Сообщение..."
              disabled={isLoading || isSending || !sessionId}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-sm sm:text-base"
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={isLoading || isSending || !sessionId || !message.trim()}
              className="rounded-xl sm:rounded-2xl h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.55)] transition-all transform hover:-translate-y-0.5 disabled:opacity-30 disabled:hover:translate-y-0 shrink-0"
              aria-label="Отправить"
            >
              <Send size={18} />
            </Button>
          </div>

          {error && <p className="mt-3 text-xs sm:text-sm text-red-400 text-center">{error}</p>}
          <div className="mt-2.5 text-[11px] text-white/35 text-center">
            Qual AI • Кодим так, что Интернет плачет
          </div>
        </div>
      </footer>
    </div>
  );
}
