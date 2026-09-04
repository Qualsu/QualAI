import { ModelItem } from "@/config/types";

export const MODEL_STORAGE_KEY = "chat-model-id";

export const DEFAULT_MODELS: ModelItem[] = [
  { id: "QualAI-2", name: "QualAI-2", badge: "Best", category: "main", vision: true },
  { id: "QualAI-2-Code", name: "QualAI-2-Code", category: "main", vision: true },
  { id: "QualAI-1.5-mini", name: "QualAI-1.5-mini", category: "main" },
  { id: "QualAI-1.6-nano", name: "QualAI-1.6-nano", category: "main" },
  { id: "QualAI-Code-Max", name: "QualAI-Code-Max", category: "main" },
  { id: "QualAI-1.5", name: "QualAI-1.5", category: "old" },
  { id: "QualAI-1.5-micro", name: "QualAI-1.5-micro (nano)", category: "old" },
  { id: "QualAI-Code", name: "QualAI-Code", category: "old" },
  { id: "QualAI-1", name: "QualAI-1", category: "old" },
  { id: "QualAI-1-mini", name: "QualAI-1-mini", category: "old" },
];