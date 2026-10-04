'use client';

import Image from "next/image";
import Link from "next/link";
import { APP_NAME, images, pages } from "@/config";
import type { LandingNavbarProps } from "@/config/types";

export default function LandingNavbar({ className }: LandingNavbarProps) {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl bg-[#111315]/85 border-b border-white/10 transition-all ${className || ""}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        <Link href={pages.ROOT} className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src={images.LOGO}
            width={96}
            height={36}
            alt={APP_NAME}
            className="object-contain drop-shadow-[0_4px_14px_rgba(118,164,255,0.25)]"
            priority
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={pages.AUTH.SIGN_IN}
            className="text-xs sm:text-sm font-medium text-white/80 hover:text-white px-3.5 sm:px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.08] transition-all"
          >
            Войти
          </Link>
          <Link
            href={pages.AUTH.SIGN_UP}
            className="text-xs sm:text-sm font-semibold text-[#0b1120] bg-gradient-to-r from-[#76a4ff] to-[#6094ff] hover:from-[#8eb5ff] hover:to-[#76a4ff] px-4 sm:px-5 py-2 rounded-xl shadow-[0_0_20px_rgba(118,164,255,0.35)] hover:shadow-[0_0_30px_rgba(118,164,255,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Начать
          </Link>
        </div>
      </div>
    </header>
  );
}
