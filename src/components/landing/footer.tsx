'use client';

import Image from "next/image";
import Link from "next/link";
import { APP_NAME, images, pages, links } from "@/config";
import type { LandingFooterProps } from "@/config/types";

export default function LandingFooter({ className }: LandingFooterProps) {
  return (
    <footer className={`mt-auto border-t border-white/10 py-8 sm:py-10 px-4 sm:px-6 bg-[#0e1012] ${className || ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href={pages.ROOT} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <Image
              src={images.LOGO}
              width={90}
              height={32}
              alt={APP_NAME}
              className="object-contain"
            />
          </Link>

          <div className="flex items-center gap-6 sm:gap-8 text-sm text-white/60">
            <a
              href={links.FEEDBACK}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Feedback
            </a>
            <a
              href={links.QUAL_ID}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Qual ID
            </a>
            <a
              href={links.TELEGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>

        <div className="w-full border-t border-white/10 my-6 sm:my-8" />

        <div className="text-center text-xs sm:text-sm text-white/40">
          © 2024-2026 Qualsu
        </div>
      </div>
    </footer>
  );
}
