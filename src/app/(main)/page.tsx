'use client';

import { sendChatMessageStream } from "@/app/api/chat";
import type { AttachedImage, ChatMessage } from "@/config/types";
import ModelSelector from "@/components/model-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModel } from "@/lib/model-context";
import { useLimits } from "@/lib/limits-context";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, ArrowUpIcon, Check, Copy, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { APP_NAME, images, pages } from "@/config";
import { processImageFile } from "@/lib/image-utils";
import { ImageAttachmentBar } from "@/components/image-attachment-bar";
import { ImageLightbox, MessageImages } from "@/components/chat-images";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { sanitizeChatError } from "@/lib/utils";

const CHAT_SESSIONS_UPDATED_EVENT = "chat-sessions-updated";
const NEW_CHAT_EVENT = "new-chat";
const TYPING_PLACEHOLDER = "__typing__";

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1.5 py-1">
      <span
        className="h-2.5 w-2.5 rounded-full bg-[#76a4ff] animate-bounce shadow-[0_0_8px_rgba(118,164,255,0.8)]"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-2.5 w-2.5 rounded-full bg-[#5d91f8] animate-bounce shadow-[0_0_8px_rgba(93,145,248,0.8)]"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce shadow-[0_0_8px_rgba(56,189,248,0.8)]"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

export default function Home() {
  const { user } = useUser();
  const { model, setModel, isCurrentModelVision } = useModel();
  const { checkLimit, recordUsage, rollbackUsage, getInfoForModel } = useLimits();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex((prev) => (prev === index ? null : prev));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const resetToNewChat = () => {
    setMessages([]);
    setSessionId(null);
    setMessage("");
    setAttachedImages([]);
    setError(null);
    setIsSending(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname !== pages.ROOT) {
        window.history.pushState(null, "", pages.ROOT);
      }
      window.dispatchEvent(new Event(CHAT_SESSIONS_UPDATED_EVENT));
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (imageFiles.length === 0) return;

      setIsProcessingImages(true);
      setError(null);

      // Auto switch to Q.AI 3 if current model is not vision-capable
      if (!isCurrentModelVision) {
        setModel("qai-3");
      }

      try {
        const processed = await Promise.all(
          imageFiles.map(async (file) => {
            const dataUrl = await processImageFile(file);
            return {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              url: dataUrl,
              name: file.name,
            };
          })
        );
        setAttachedImages((prev) => [...prev, ...processed]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при обработке изображения");
      } finally {
        setIsProcessingImages(false);
      }
    },
    [isCurrentModelVision, setModel]
  );

  const handleRemoveImage = (id: string) => {
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        void handleFiles(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFiles(e.dataTransfer.files);
    }
  };

  useEffect(() => {
    const handleNewChatEvent = () => {
      resetToNewChat();
    };

    const handlePopState = () => {
      if (typeof window !== "undefined" && window.location.pathname === pages.ROOT) {
        resetToNewChat();
      }
    };

    window.addEventListener(NEW_CHAT_EVENT, handleNewChatEvent);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener(NEW_CHAT_EVENT, handleNewChatEvent);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  const accountId = user?.id ?? "guest";

  const handleSend = async (textToSend?: string) => {
    const promptToSend = (textToSend ?? message).trim();
    if ((!promptToSend && attachedImages.length === 0) || isSending || isProcessingImages) {
      return;
    }

    const currentImages = [...attachedImages];
    const imagesToSend = currentImages.map((img) => img.url);

    let activeModel = model;
    if (imagesToSend.length > 0 && !isCurrentModelVision) {
      activeModel = "qai-3";
      setModel("qai-3");
    }

    const limitCheck = checkLimit(activeModel);
    if (!limitCheck.allowed) {
      const otherGroup = limitCheck.group === "main" ? "старые модели QualAI" : "Q.AI 3 и 3 Mini";
      setError(
        `Дневной лимит для ${limitCheck.groupTitle} исчерпан (${limitCheck.limit} из ${limitCheck.limit}). Вы можете переключиться на ${otherGroup} или подождать сброса в 00:00.`
      );
      return;
    }

    const recorded = recordUsage(activeModel);
    if (!recorded) {
      setError(
        `Дневной лимит для ${limitCheck.groupTitle} исчерпан (${limitCheck.limit} из ${limitCheck.limit}).`
      );
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage("");
    setAttachedImages([]);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: promptToSend,
        images: imagesToSend.length > 0 ? imagesToSend : undefined,
      },
      { role: "assistant", content: TYPING_PLACEHOLDER, model_id: activeModel },
    ]);

    try {
      const response = await sendChatMessageStream(
        {
          account_id: accountId,
          message: promptToSend,
          model_id: activeModel,
          session_id: sessionId ?? undefined,
          images: imagesToSend.length > 0 ? imagesToSend : undefined,
        },
        (initData) => {
          setModel(initData.model_id);
          setSessionId(initData.session_id);
          if (typeof window !== "undefined") {
            window.history.pushState(null, "", `/${initData.session_id}`);
            window.dispatchEvent(new Event(CHAT_SESSIONS_UPDATED_EVENT));
          }
        },
        (chunk) => {
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const next = [...prev];
            const lastMsg = next[next.length - 1];
            if (lastMsg.role === "assistant") {
              const currentContent = lastMsg.content === TYPING_PLACEHOLDER ? "" : lastMsg.content;
              next[next.length - 1] = {
                ...lastMsg,
                content: currentContent + chunk,
              };
            }
            return next;
          });
        }
      );

      setModel(response.model_id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CHAT_SESSIONS_UPDATED_EVENT));
      }
    } catch (err: unknown) {
      rollbackUsage(activeModel);
      setMessages((prev) => prev.filter((m) => m.content !== TYPING_PLACEHOLDER));
      const errorMessage = sanitizeChatError(err);
      setError(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const firstUserMsg = messages.find((m) => m.role === "user");
  const firstUserText = firstUserMsg?.content?.trim();
  const chatTitle = firstUserText
    ? firstUserText.length > 50
      ? `${firstUserText.slice(0, 50)}...`
      : firstUserText
    : firstUserMsg?.images && firstUserMsg.images.length > 0
    ? "📷 Изображение"
    : sessionId
    ? `Чат ${sessionId.slice(0, 8)}`
    : APP_NAME;
  const pageTitle = messages.length > 0 ? `${APP_NAME} | ${chatTitle}` : APP_NAME;

  return (
    <div
      className="flex h-full min-h-0 flex-col text-white relative isolate"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <title>{pageTitle}</title>

      {/* Drag & drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#17191c]/85 backdrop-blur-md border-2 border-dashed border-[#76a4ff]/80 rounded-3xl m-4 pointer-events-none animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-[#76a4ff]/20 text-[#76a4ff] mb-3 shadow-[0_0_30px_rgba(118,164,255,0.4)]">
            <ImagePlus size={36} />
          </div>
          <p className="text-lg font-semibold text-white">Перетащите изображения сюда</p>
          <p className="text-sm text-white/60 mt-1">PNG, JPG, WEBP или GIF</p>
        </div>
      )}

      <ImageLightbox src={activeLightboxImage} onClose={() => setActiveLightboxImage(null)} />

      {/* Desktop Top bar with Model Selector */}
      <header className="hidden md:flex shrink-0 border-b border-white/10 px-4 sm:px-6 py-3 items-center justify-between backdrop-blur-xl bg-[#17191c]/80 z-20">
        <div className="flex items-center gap-3">
          <ModelSelector />
        </div>
      </header>

      {/* Main chat area */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {messages.length === 0 ? (
          <div className="h-full max-w-4xl mx-auto flex items-center justify-center py-8 gap-3">
            <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-full bg-[#76a4ff]/20 blur-2xl animate-pulse" />
              <Image
                src={images.MINI_LOGO}
                width={35}
                height={35}
                alt={APP_NAME}
                className="relative drop-shadow-[0_12px_30px_rgba(118,164,255,0.35)]"
              />
            </div>

            <h1 className="text-4xl font-bold text-center tracking-tight leading-tight text-white">
              Кодим так, что Интернет плачет
            </h1>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={item.role === "user" ? "ml-auto max-w-[85%] sm:max-w-[75%]" : "mr-auto w-full max-w-3xl sm:max-w-4xl"}
              >
                {item.role === "user" ? (
                  <div className="bg-[#1d3d75] text-white rounded-2xl sm:rounded-[22px] px-4 sm:px-5 py-2.5 sm:py-3 text-sm sm:text-base leading-relaxed">
                    {item.images && item.images.length > 0 && (
                      <MessageImages images={item.images} onImageClick={setActiveLightboxImage} />
                    )}
                    <div className="whitespace-pre-wrap wrap-break-word">{item.content}</div>
                  </div>
                ) : (
                  <div className="text-white/95 text-sm sm:text-base leading-relaxed">
                    {item.images && item.images.length > 0 && (
                      <MessageImages images={item.images} onImageClick={setActiveLightboxImage} />
                    )}
                    {item.content === TYPING_PLACEHOLDER ? (
                      <TypingDots />
                    ) : (
                      <>
                        <MarkdownRenderer content={item.content} />
                        <div className="mt-2 flex items-center gap-1 text-white/50">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(item.content, index)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
                            title={copiedIndex === index ? "Скопировано!" : "Скопировать ответ"}
                            aria-label="Скопировать ответ"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={16} className="text-[#76a4ff]" />
                                <span className="text-xs text-[#76a4ff]">Скопировано</span>
                              </>
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Dock */}
      <footer className="shrink-0 px-4 sm:px-6 pb-6 pt-2 z-20">
        <div className="max-w-4xl mx-auto">
          <div className="surface-panel rounded-2xl sm:rounded-3xl border-white/15 bg-[#1b1e22]/85 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden transition-all focus-within:border-[#76a4ff]/50 focus-within:shadow-[0_20px_60px_rgba(118,164,255,0.15)]">
            <ImageAttachmentBar
              images={attachedImages}
              onRemove={handleRemoveImage}
              isProcessing={isProcessingImages}
              disabled={isSending}
              isVisionSupported={isCurrentModelVision}
              recommendedModelName="Q.AI 3"
              onSwitchToVisionModel={() => setModel("qai-3")}
            />
            <div className="p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isProcessingImages}
                size="icon"
                variant="ghost"
                className="rounded-full h-10 w-10 sm:h-11 sm:w-11 text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Прикрепить изображение"
                aria-label="Прикрепить изображение"
              >
                <ImagePlus size={20} />
              </Button>
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  getInfoForModel(model).isExceeded
                    ? `Дневной лимит для ${getInfoForModel(model).shortTitle} исчерпан (${getInfoForModel(model).limit}/${getInfoForModel(model).limit})...`
                    : attachedImages.length > 0
                    ? "Добавь описание или нажми Enter для отправки..."
                    : "Спроси о чём угодно или попроси написать код..."
                }
                disabled={isSending}
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 sm:px-3 py-2 text-sm sm:text-base"
              />
              <Button
                onClick={() => handleSend()}
                disabled={
                  isSending ||
                  isProcessingImages ||
                  (!message.trim() && attachedImages.length === 0) ||
                  getInfoForModel(model).isExceeded
                }
                size="icon"
                className="rounded-full h-10 w-10 sm:h-11 sm:w-11 bg-[#76a4ff] hover:bg-[#6094ff] text-white transition-colors disabled:opacity-30 shrink-0 cursor-pointer"
                aria-label="Отправить"
              >
                <ArrowUpIcon className="size-6 stroke-[2.5]" />
              </Button>
            </div>
          </div>

          {getInfoForModel(model).isExceeded && !error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <AlertCircle size={15} className="shrink-0 text-amber-400" />
              <span>
                Дневной лимит для {getInfoForModel(model).shortTitle} исчерпан ({getInfoForModel(model).limit}/{getInfoForModel(model).limit}). Выберите другую модель в меню сверху.
              </span>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-red-300 bg-red-500/15 border border-red-500/30 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
          <div className="mt-2.5 text-[11px] text-white/35 text-center">
            Ответы Q.AI и QualAI могут быть не точными. Рекомендуем проверять информацию
          </div>
        </div>
      </footer>
    </div>
  );
}
