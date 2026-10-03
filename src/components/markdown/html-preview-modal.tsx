"use client";

import type { HtmlPreviewModalProps, HtmlPreviewViewport } from "@/config/types";
import { HtmlIframe } from "@/components/markdown/html-iframe";
import { ExternalLink, Globe, Monitor, RotateCw, Smartphone, Tablet, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function HtmlPreviewModal({
  srcDoc,
  isOpen,
  onClose,
  onOpenNewTab,
  title = "Предпросмотр сайта",
}: HtmlPreviewModalProps) {
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState<HtmlPreviewViewport>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-[#14161a]/95 border-b border-white/10 shrink-0 select-none z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#76a4ff]/15 text-[#76a4ff]">
            <Globe size={18} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono">
              HTML
            </span>
          </div>
        </div>

        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewport === "desktop"
                ? "bg-[#76a4ff]/25 text-[#9fc3ff] border border-[#76a4ff]/40 shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Широкий экран (100%)"
          >
            <Monitor size={14} />
            <span className="hidden sm:inline">ПК</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewport === "tablet"
                ? "bg-[#76a4ff]/25 text-[#9fc3ff] border border-[#76a4ff]/40 shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Планшет (768px)"
          >
            <Tablet size={14} />
            <span className="hidden sm:inline">Планшет</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewport === "mobile"
                ? "bg-[#76a4ff]/25 text-[#9fc3ff] border border-[#76a4ff]/40 shadow-xs"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
            title="Смартфон (375px)"
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Телефон</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Перезагрузить страницу"
            aria-label="Перезагрузить страницу"
          >
            <RotateCw size={16} />
          </button>
          <button
            type="button"
            onClick={onOpenNewTab}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium transition-colors cursor-pointer"
            title="Открыть сайт в новой вкладке браузера"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">В новой вкладке</span>
          </button>
          <div className="w-px h-4 bg-white/15 mx-1" />
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Закрыть (Esc)"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 w-full flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`h-full transition-all duration-300 flex flex-col ${
            viewport === "desktop"
              ? "w-full rounded-xl overflow-hidden shadow-2xl bg-white"
              : viewport === "tablet"
              ? "w-[768px] max-w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800 bg-white"
              : "w-[375px] max-w-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-zinc-800 bg-white"
          }`}
        >
          <HtmlIframe
            refreshKey={refreshKey}
            srcDoc={srcDoc}
            title={title}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
