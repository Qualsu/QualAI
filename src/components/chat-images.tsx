"use client";

import type { ImageLightboxProps, MessageImagesProps } from "@/config/types";
import { Maximize2, X } from "lucide-react";
import { useEffect } from "react";

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображения"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-lg border border-white/15 cursor-pointer z-10"
        aria-label="Закрыть"
      >
        <X size={20} />
      </button>
      <div
        className="relative max-w-4xl max-h-[88vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Просмотр"
          className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
        />
      </div>
    </div>
  );
}

export function MessageImages({ images, onImageClick }: MessageImagesProps) {
  if (!images || images.length === 0) return null;

  const isMultiple = images.length > 1;

  return (
    <div
      className={`mb-3 grid gap-2.5 ${
        isMultiple
          ? images.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
          : "grid-cols-1"
      }`}
    >
      {images.map((imgSrc, idx) => (
        <div
          key={idx}
          onClick={() => onImageClick?.(imgSrc)}
          className="group relative overflow-hidden rounded-xl border border-white/15 bg-black/30 backdrop-blur-sm cursor-pointer transition-all hover:border-purple-400/50 hover:shadow-[0_8px_25px_rgba(168,85,247,0.2)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`Прикреплённое изображение ${idx + 1}`}
            className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
              isMultiple ? "h-36 sm:h-44" : "max-h-72 w-auto"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-lg">
              <Maximize2 size={18} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
