'use client';

import { fetchAvailableModels, sendChatMessage } from "@/app/api/chat";
import type { ChatMessage } from "@/app/api/types";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
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

const QUICK_PROMPTS = [
  {
    title: "💻 Написать код",
    desc: "React-компонент с анимацией и стеклянным эффектом",
    prompt: "Напиши React-компонент с анимацией и стеклянным эффектом в стиле современных веб-приложений.",
  },
  {
    title: "⚡ Оптимизация",
    desc: "Как ускорить работу Next.js и снизить бандл",
    prompt: "Как оптимизировать производительность и снизить размер бандла в Next.js 15?",
  },
  {
    title: "🎨 UI/UX Стилизация",
    desc: "Идеи палитры и темного стеклянного дизайна",
    prompt: "Предложи современную цветовую палитру и стили для темного интерфейса в стиле Glassmorphism.",
  },
  {
    title: "🚀 Архитектура",
    desc: "Паттерны проектирования для Fullstack веб-сервиса",
    prompt: "Расскажи, как правильно спроектировать архитектуру Fullstack-приложения на Next.js и FastAPI.",
  },
];

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("qwen2.5:1.5b");
  const [models, setModels] = useState<Record<string, string>>({
    "qwen2.5:0.5b": "QualAI-1-mini",
    "qwen2.5:1.5b": "QualAI-1",
    "qwen2.5-coder:1.5b": "QualAI-Code",
    "qwen2.5-coder:3b": "QualAI-Code-Max",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

  const handleSend = async (textToSend?: string) => {
    const promptToSend = (textToSend ?? message).trim();
    if (!promptToSend || isSending) {
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: promptToSend },
      { role: "assistant", content: TYPING_PLACEHOLDER, model_id: model },
    ]);

    try {
      const response = await sendChatMessage({
        account_id: accountId,
        message: promptToSend,
        model_id: model,
      });

      const assistantReply = resolveAssistantReply(response.response, response.history);
      await animateAssistantMessage(assistantReply, response.model_id);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CHAT_SESSIONS_UPDATED_EVENT));
      }

      setModel(response.model_id);
      router.push(`/${response.session_id}`);
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setError("Не удалось отправить сообщение. Проверь API и попробуй снова.");
    } finally {
      setIsSending(false);
    }
  };

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

      {/* Main chat area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {messages.length === 0 ? (
          <div className="h-full max-w-4xl mx-auto flex flex-col items-center justify-center py-8">
            <div className="relative mb-6">
              <div className="pointer-events-none absolute -inset-4 rounded-full bg-purple-600/20 blur-2xl animate-pulse" />
              <Image
                src="/mini-logo.svg"
                width={80}
                height={80}
                alt="Qual AI"
                className="relative drop-shadow-[0_12px_30px_rgba(168,85,247,0.35)]"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center tracking-tight leading-tight text-white mb-3">
              Кодим так, что Интернет плачет
            </h1>
            <p className="text-sm sm:text-base text-white/70 text-center max-w-lg mb-8 sm:mb-12">
              Qual AI — Умный искусственный интеллект от команды Qualsu для разработки, генерации кода и решения любых задач.
            </p>

            {/* Quick prompt cards in Qualsu ProjectCard style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl">
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMessage(item.prompt);
                    void handleSend(item.prompt);
                  }}
                  className="surface-panel text-left p-4 rounded-2xl border-white/10 hover:border-white/25 bg-white/[0.04] hover:bg-white/[0.08] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] group cursor-pointer"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-xs text-white/40 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1 line-clamp-2">{item.desc}</div>
                </button>
              ))}
            </div>
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
              placeholder="Спроси о чём угодно или попроси написать код..."
              disabled={isSending}
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2 text-sm sm:text-base"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isSending || !message.trim()}
              size="icon"
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
