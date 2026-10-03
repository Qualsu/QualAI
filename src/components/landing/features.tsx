'use client';

import { Eye, Lightbulb, Zap } from "lucide-react";
import { pages } from "@/config";
import type { LandingFeature, LandingFeaturesProps } from "@/config/types";

const FEATURES: LandingFeature[] = [
  {
    icon: "lightbulb",
    title: "Ответы и помощь в делах",
    description: "Объяснит сложную тему простыми словами, напишет текст, составит письмо, план поездки или сгенерирует свежие идеи для проекта.",
  },
  {
    icon: "eye",
    title: "Анализ фото и документов",
    description: "Сфотографируйте документ, чек, страницу книги или сложную схему — Q.AI 3 мгновенно поймёт визуальный контекст и ответит на вопросы.",
  },
  {
    icon: "zap",
    title: "Мгновенная скорость",
    description: "Сверхбыстрый отклик с моделью Q.AI 3 Mini. Ответ появляется сразу на ваших глазах, без томительного ожидания и задержек.",
  },
];

export default function LandingFeatures({ className }: LandingFeaturesProps) {
  return (
    <section id={pages.ANCHORS.FEATURES.slice(1)} className={`py-16 sm:py-24 px-4 sm:px-6 relative border-t border-white/10 bg-white/[0.01] ${className || ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#76a4ff]">
            Возможности
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Искусственный интеллект, понятный каждому
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            Простые и полезные функции, которые экономят ваше время каждый день
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="surface-panel rounded-2xl p-6 sm:p-7 border border-white/10 bg-[#17191c]/70 hover:border-[#76a4ff]/40 transition-all flex flex-col group hover:-translate-y-1 duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-[#1b2538] border border-[#76a4ff]/25 flex items-center justify-center text-[#76a4ff] mb-5 group-hover:scale-105 transition-transform">
                {item.icon === "lightbulb" && <Lightbulb size={22} />}
                {item.icon === "eye" && <Eye size={22} />}
                {item.icon === "zap" && <Zap size={22} />}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2.5">
                {item.title}
              </h3>
              <p className="text-sm text-white/65 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
