"use client";

import { useModel } from "@/lib/model-context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ModelSelectorProps = {
  className?: string;
};

export default function ModelSelector({ className }: ModelSelectorProps) {
  const { model, setModel, models, getModelLabel } = useModel();

  const mainModels = models.filter((m) => m.category !== "old");
  const oldModels = models.filter((m) => m.category === "old");

  const selectedModel = models.find(
    (m) =>
      m.id.toLowerCase() === model.toLowerCase() ||
      m.name.toLowerCase() === model.toLowerCase()
  );
  const isSelectedOrangeBadge =
    Boolean(selectedModel?.badge) &&
    (selectedModel!.badge!.toLowerCase().includes("fast") ||
      selectedModel!.badge!.toLowerCase().includes("micro"));

  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger
        className={`surface-panel w-auto min-w-[140px] max-w-[220px] sm:min-w-[190px] sm:max-w-none bg-white/[0.05] hover:bg-white/[0.09] border-white/15 text-white rounded-xl shadow-sm transition-all focus:ring-purple-500/40 text-xs sm:text-sm py-1 sm:py-2 px-2.5 sm:px-3 h-8 sm:h-10 ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate w-full pr-1">
          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0" />
          <span className="truncate">{getModelLabel(model)}</span>
          {selectedModel?.badge && (
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold border rounded-md uppercase tracking-wider shadow-xs shrink-0 ${
                isSelectedOrangeBadge
                  ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30"
                  : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {selectedModel.badge}
            </span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={4}
        align="start"
        className="surface-panel bg-[#1e131d]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5 z-50 min-w-[200px]"
      >
        <SelectGroup>
          {mainModels.map((m) => {
            const isOrangeBadge =
              m.badge &&
              (m.badge.toLowerCase().includes("fast") ||
                m.badge.toLowerCase().includes("micro"));
            const badgeStyle = isOrangeBadge
              ? "bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30"
              : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30";

            return (
              <SelectItem
                key={m.id}
                value={m.id}
                className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5"
              >
                <div className="flex items-center justify-between gap-3 w-full pr-3">
                  <span>{m.name}</span>
                  {m.badge && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold border rounded-md uppercase tracking-wider shadow-xs shrink-0 ${badgeStyle}`}>
                      {m.badge}
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>

        {oldModels.length > 0 && (
          <>
            <SelectSeparator className="bg-white/10 my-1.5" />
            <SelectGroup>
              <SelectLabel className="px-2 py-1 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                Old
              </SelectLabel>
              {oldModels.map((m) => {
                return (
                  <SelectItem
                    key={m.id}
                    value={m.id}
                    className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5 text-white/70"
                  >
                    <div className="flex items-center gap-2">
                      <span>{m.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
