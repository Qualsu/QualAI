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

  const allModelKeys = Object.keys(models);

  const isOldModel = (key: string, label: string) => {
    return (
      key === "qwen2.5:1.5b" ||
      key === "qwen2.5:0.5b" ||
      label === "QualAI-1" ||
      label === "QualAI-1-mini"
    );
  };

  const isBestModel = (key: string, label: string) => {
    return (
      key === "qwen3:1.7b" ||
      key === "qwen3:0.6b" ||
      label === "QualAI-1.5" ||
      label === "QualAI-1.5-mini"
    );
  };

  const mainModels = allModelKeys.filter(
    (key) => !isOldModel(key, getModelLabel(key))
  );
  const oldModels = allModelKeys.filter((key) =>
    isOldModel(key, getModelLabel(key))
  );

  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger
        className={`surface-panel w-auto min-w-[130px] max-w-[170px] sm:min-w-[180px] sm:max-w-none bg-white/[0.05] hover:bg-white/[0.09] border-white/15 text-white rounded-xl shadow-sm transition-all focus:ring-purple-500/40 text-xs sm:text-sm py-1 sm:py-2 px-2.5 sm:px-3 h-8 sm:h-10 ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0" />
          <SelectValue placeholder="Выберите модель">
            {getModelLabel(model)}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={4}
        align="start"
        className="surface-panel bg-[#1e131d]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5 z-50 min-w-[200px]"
      >
        <SelectGroup>
          {mainModels.map((modelId) => {
            const label = getModelLabel(modelId);
            const isBest = isBestModel(modelId, label);
            return (
              <SelectItem
                key={modelId}
                value={modelId}
                className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5"
              >
                <div className="flex items-center justify-between gap-3 w-full pr-3">
                  <span>{label}</span>
                  {isBest && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 rounded-md uppercase tracking-wider shadow-xs shrink-0">
                      Best
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
              {oldModels.map((modelId) => {
                const label = getModelLabel(modelId);
                return (
                  <SelectItem
                    key={modelId}
                    value={modelId}
                    className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm my-0.5 text-white/70"
                  >
                    <div className="flex items-center gap-2">
                      <span>{label}</span>
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
