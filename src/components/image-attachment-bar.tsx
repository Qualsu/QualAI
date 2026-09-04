"use client";

import type { ImageAttachmentBarProps } from "@/config/types";
import { AlertTriangle, Loader2, X, Sparkles } from "lucide-react";

export function ImageAttachmentBar({
  images,
  onRemove,
  isProcessing,
  disabled,
  isVisionSupported,
  onSwitchToVisionModel,
}: ImageAttachmentBarProps) {
  if (images.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 px-3 pt-2 pb-1 border-b border-white/10">
      {/* Warning banner if attached images present but current model lacks vision */}
      {!isVisionSupported && images.length > 0 && (
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle size={14} className="shrink-0 text-amber-400" />
            <span className="truncate">Текущая модель не поддерживает vision</span>
          </div>
          {onSwitchToVisionModel && (
            <button
              type="button"
              onClick={onSwitchToVisionModel}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 font-medium text-[11px] border border-amber-500/40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} className="shrink-0" />
              <span>QualAI-2</span>
            </button>
          )}
        </div>
      )}

      {/* Thumbnails row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-white/20 bg-black/40 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.name || "Прикрепленное изображение"}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors cursor-pointer"
                aria-label="Удалить изображение"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="shrink-0 w-16 h-16 rounded-xl border border-white/20 bg-white/5 flex flex-col items-center justify-center text-white/60 gap-1">
            <Loader2 size={16} className="animate-spin text-purple-400" />
            <span className="text-[10px]">Сжатие...</span>
          </div>
        )}
      </div>
    </div>
  );
}
