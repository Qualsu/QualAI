'use client';

import Image from "next/image";
import Link from "next/link";
import { Check, CheckCircle2 } from "lucide-react";
import { images, pages } from "@/config";
import type { LandingModelItem, LandingModelsProps } from "@/config/types";

const MODELS: LandingModelItem[] = [
  {
    name: "Q.AI 3",
    badge: "Флагман со зрением",
    description: "Основная модель для сложных вопросов, глубокого анализа, работы с текстами и распознавания любых изображений.",
    highlights: [
      "Распознавание фото, документов и графиков",
      "Глубокий анализ и развернутые ответы",
      "Помощь в учебе, работе и творчестве",
    ],
  },
  {
    name: "Q.AI 3 Mini",
    badge: "Сверхбыстрая",
    description: "Легковесная и молниеносная модель. Идеальна для быстрых переводов, коротких справок и повседневных подсказок.",
    highlights: [
      "Моментальный вывод ответа за секунду",
      "Быстрые переводы и редактирование текста",
      "Всегда доступна для коротких вопросов",
    ],
  },
];

export default function LandingModels({ className }: LandingModelsProps) {
  return (
    <section id={pages.ANCHORS.MODELS.slice(1)} className={`py-16 sm:py-24 px-4 sm:px-6 border-t border-white/10 relative ${className || ""}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#76a4ff]">
            Линейка моделей
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Две модели для любых ваших задач
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            Флагман со зрением для глубокого понимания и сверхбыстрая версия для мгновенных ответов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {MODELS.map((model, idx) => {
            const isFlagship = model.name === "Q.AI 3";
            return (
              <div
                key={idx}
                className={`rounded-2xl p-7 sm:p-9 border flex flex-col justify-between transition-all ${
                  isFlagship
                    ? "border-[#76a4ff]/50 bg-gradient-to-b from-[#192334] to-[#141a24] shadow-[0_0_35px_rgba(118,164,255,0.15)]"
                    : "border-white/10 bg-[#17191c]/70 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={images.FAVICON}
                        width={28}
                        height={28}
                        alt=""
                      />
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {model.name}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        isFlagship
                          ? "bg-[#76a4ff]/20 text-[#76a4ff] border-[#76a4ff]/40"
                          : "bg-cyan-400/15 text-cyan-300 border-cyan-400/30"
                      }`}
                    >
                      {model.badge}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-6">
                    {model.description}
                  </p>

                  {model.highlights && (
                    <ul className="space-y-2.5 mb-6">
                      {model.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
                          <CheckCircle2 size={16} className={isFlagship ? "text-[#76a4ff] shrink-0" : "text-cyan-400 shrink-0"} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/50 flex items-center gap-1.5">
                    <Check size={14} className="text-[#76a4ff]" />
                    Включено в бесплатный тариф
                  </span>
                  <Link
                    href={pages.AUTH.SIGN_UP}
                    className="text-xs font-semibold text-[#76a4ff] hover:text-[#a0c2ff] transition-colors flex items-center gap-1"
                  >
                    Попробовать →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
