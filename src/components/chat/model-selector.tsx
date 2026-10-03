"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModel } from "@/lib/model-context";
import { useLimits } from "@/lib/limits-context";
import { cn } from "@/lib/utils";
import type { ModelSelectorProps } from "@/config/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";

export default function ModelSelector({ className }: ModelSelectorProps) {
  const { model, setModel, models, getModelLabel } = useModel();
  const { mainInfo, oldInfo } = useLimits();
  const [isOldExpanded, setIsOldExpanded] = useState(false);

  const mainModels = models.filter((m) => m.category !== "old");
  const oldModels = models.filter((m) => m.category === "old");

  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger
        className={`surface-panel w-auto min-w-[140px] max-w-[240px] sm:min-w-[200px] sm:max-w-none bg-white/[0.05] hover:bg-white/[0.09] border-white/15 text-white rounded-xl shadow-sm transition-all focus:ring-[#76a4ff]/40 text-xs sm:text-sm py-1 sm:py-2 px-2.5 sm:px-3 h-8 sm:h-10 ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate w-full pr-1">
          <span className="h-2 w-2 rounded-full bg-[#76a4ff] shadow-[0_0_8px_rgba(118,164,255,0.8)] shrink-0" />
          <span className="truncate">{getModelLabel(model)}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={4}
        align="start"
        className="surface-panel bg-[#202328]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5 z-50 min-w-[220px]"
      >
        <SelectGroup>
          <div className="px-2.5 py-1 flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold text-white/40">
            <span>Основные</span>
            <span className={mainInfo.isExceeded ? "text-red-400 font-bold" : "text-[#76a4ff]"}>
              {mainInfo.remaining}/{mainInfo.limit}
            </span>
          </div>
          {mainModels.map((m) => (
            <SelectItem
              key={m.id}
              value={m.id}
              className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5"
            >
              <span>{m.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>

        {oldModels.length > 0 && (
          <>
            <SelectSeparator className="bg-white/10 my-1.5" />
            <div className="px-1 py-0.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOldExpanded((prev) => !prev);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOldExpanded((prev) => !prev);
                  }
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-white/50 hover:text-white/80 hover:bg-white/5 rounded-xl transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5">
                  <span className="uppercase text-[10px] tracking-wider font-bold">Old</span>
                  <span className="text-[10px] text-white/35 font-normal">({oldModels.length})</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] ${oldInfo.isExceeded ? "text-red-400 font-bold" : "text-white/40"}`}>
                    {oldInfo.remaining}/{oldInfo.limit}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-white/40 transition-transform duration-200",
                      isOldExpanded && "rotate-180"
                    )}
                  />
                </div>
              </button>
            </div>
            {isOldExpanded && (
              <SelectGroup className="mt-0.5">
                {oldModels.map((m) => (
                  <SelectItem
                    key={m.id}
                    value={m.id}
                    className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5 text-white/70"
                  >
                    <span>{m.name}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  );
}
