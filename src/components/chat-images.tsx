"use client";

import type { ImageLightboxProps, MessageImagesProps } from "@/config/types";
import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!src) return;
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
  }, [src, onClose]);

  if (!src || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображения"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
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
          className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>,
    document.body
  );
}

export function MessageImages({ images, onImageClick }: MessageImagesProps) {
  if (!images || images.length === 0) return null;

  const isMultiple = images.length > 1;

  return (
    <div
      className={
        isMultiple
          ? `mb-3 grid gap-2.5 ${
              images.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
            }`
          : "mb-3 flex flex-wrap"
      }
    >
      {images.map((imgSrc, idx) => (
        <div
          key={idx}
          onClick={() => onImageClick?.(imgSrc)}
          className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all hover:shadow-[0_8px_25px_rgba(118,164,255,0.2)] ${
            isMultiple ? "" : "w-fit max-w-full"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`Прикреплённое изображение ${idx + 1}`}
            className={`transition-transform duration-300 group-hover:scale-[1.02] rounded-xl ${
              isMultiple
                ? "w-full h-36 sm:h-44 object-cover"
                : "max-h-72 sm:max-h-80 w-auto max-w-full object-contain"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white shadow-lg">
              <Maximize2 size={18} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
