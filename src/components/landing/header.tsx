'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { images, pages } from "@/config";
import type { LandingHeaderProps } from "@/config/types";

export default function LandingHeader({ className }: LandingHeaderProps) {
  return (
    <section className={`relative pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden ${className || ""}`}>
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#76a4ff]/20 via-[#4f83f7]/10 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-96 h-96 bg-[#76a4ff]/10 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full" />

      <div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b2230] border border-[#76a4ff]/30 text-xs sm:text-sm font-medium text-[#76a4ff] shadow-[0_0_15px_rgba(118,164,255,0.15)] mb-6 sm:mb-8 animate-in fade-in duration-300">
          <Image
            src={images.FAVICON}
            width={14}
            height={14}
            alt=""
          />
          <span>Умный искусственный интеллект на каждый день</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.12] text-white max-w-4xl">
          Ваш персональный помощник для{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#76a4ff] via-[#a3c3ff] to-[#6094ff]">
            жизни, работы и учёбы
          </span>
        </h1>

        <p className="mt-5 sm:mt-6 text-base sm:text-xl text-white/70 max-w-2xl leading-relaxed font-normal">
          Мгновенные ответы на любые вопросы, анализ текстов и фотографий, поиск идей и решение повседневных задач в простом и удобном интерфейсе.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
          <Link
            href={pages.AUTH.SIGN_UP}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[#0b1120] bg-gradient-to-r from-[#76a4ff] to-[#4f83f7] hover:from-[#8eb5ff] hover:to-[#6094ff] shadow-[0_0_30px_rgba(118,164,255,0.4)] hover:shadow-[0_0_40px_rgba(118,164,255,0.65)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base cursor-pointer"
          >
            <span>Попробовать бесплатно</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href={pages.AUTH.SIGN_IN}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white/90 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/15 hover:border-white/30 transition-all text-sm sm:text-base"
          >
            <span>Войти в аккаунт</span>
          </Link>
        </div>

        <div id={pages.ANCHORS.PREVIEW.slice(1)} className="mt-12 sm:mt-16 w-full max-w-3xl text-left">
          <div className="surface-panel rounded-2xl sm:rounded-3xl border border-white/15 bg-[#17191c]/90 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/70">
                <Image src={images.FAVICON} width={14} height={14} alt="" />
                <span>Q.AI 3 </span>
              </div>
              <div className="text-xs text-[#76a4ff] font-medium hidden sm:flex items-center gap-1">
                <Zap size={13} />
                <span>до 120 tok/sec</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 sm:py-7 flex flex-col gap-4">
              <div className="ml-auto max-w-[90%] sm:max-w-[80%]">
                <div className="bg-[#1d3d75] text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm sm:leading-relaxed shadow-sm">
                  Помоги составить удобный план подготовки к экзамену на неделю без перегрузок
                </div>
              </div>

              <div className="mr-auto w-full">
                <div className="text-white/95 text-xs sm:text-sm leading-relaxed flex flex-col gap-3">
                  <p className="text-white/80">
                    Конечно! Вот сбалансированный и понятный план подготовки без выгорания:
                  </p>

                  <div className="rounded-xl border border-white/10 bg-[#141a24] p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#76a4ff] font-bold">•</span>
                      <span><strong className="text-white">Понедельник–Вторник:</strong> разбор ключевых конспектов и определений (по 1.5–2 часа с перерывами)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#76a4ff] font-bold">•</span>
                      <span><strong className="text-white">Среда–Четверг:</strong> решение типовых практических заданий и разбор частых ошибок</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#76a4ff] font-bold">•</span>
                      <span><strong className="text-white">Пятница:</strong> финальное повторение сложных тем и отдых перед днем сдачи</span>
                    </div>
                  </div>

                  <p className="text-white/70 text-xs">
                    Готов разобрать любую тему или составить подробный конспект прямо сейчас!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
