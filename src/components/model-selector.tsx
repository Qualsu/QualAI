"use client";

import { useModel } from "@/lib/model-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ModelSelectorProps = {
  className?: string;
};

export default function ModelSelector({ className }: ModelSelectorProps) {
  const { model, setModel, models, getModelLabel } = useModel();

  return (
    <Select value={model} onValueChange={setModel}>
      <SelectTrigger
        className={`surface-panel w-auto min-w-[130px] max-w-[170px] sm:min-w-[180px] sm:max-w-none bg-white/[0.05] hover:bg-white/[0.09] border-white/15 text-white rounded-xl shadow-sm transition-all focus:ring-purple-500/40 text-xs sm:text-sm py-1 sm:py-2 px-2.5 sm:px-3 h-8 sm:h-10 ${
          className ?? ""
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] shrink-0" />
          <SelectValue placeholder="Выберите модель" />
        </div>
      </SelectTrigger>
      <SelectContent className="surface-panel bg-[#1e131d]/95 backdrop-blur-2xl border-white/15 text-white rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.5)] p-1.5 z-50">
        {Object.keys(models).map((modelId) => (
          <SelectItem
            key={modelId}
            value={modelId}
            className="rounded-xl hover:bg-white/10 focus:bg-white/10 cursor-pointer text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <span>{getModelLabel(modelId)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
