"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAvailableModels } from "@/app/api/chat";
import type { ModelItem } from "@/app/api/types";

const MODEL_STORAGE_KEY = "chat-model-id";

const DEFAULT_MODELS: ModelItem[] = [
  { id: "QualAI-1.5", name: "QualAI-1.5", badge: "Best", category: "main" },
  { id: "QualAI-1.5-mini", name: "QualAI-1.5-mini", badge: "Best", category: "main" },
  { id: "QualAI-Code", name: "QualAI-Code", category: "main" },
  { id: "QualAI-Code-Max", name: "QualAI-Code-Max", category: "main" },
  { id: "QualAI-1", name: "QualAI-1", category: "old" },
  { id: "QualAI-1-mini", name: "QualAI-1-mini", category: "old" },
];

type ModelContextType = {
  model: string;
  setModel: (model: string) => void;
  models: ModelItem[];
  getModelLabel: (modelId: string) => string;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

function normalizeModels(dataModels: unknown): ModelItem[] {
  if (!dataModels) {
    return DEFAULT_MODELS;
  }

  if (Array.isArray(dataModels)) {
    if (dataModels.length === 0) return DEFAULT_MODELS;
    if (typeof dataModels[0] === "string") {
      return (dataModels as string[]).map((id) => ({ id, name: id }));
    }
    return (dataModels as ModelItem[]).filter(
      (m) => m && typeof m === "object" && Boolean(m.id)
    );
  }

  if (typeof dataModels === "object") {
    const items: ModelItem[] = [];
    for (const [key, val] of Object.entries(dataModels)) {
      if (typeof val === "string") {
        items.push({ id: key, name: val });
      } else if (val && typeof val === "object") {
        const itemObj = val as Record<string, unknown>;
        items.push({
          id: (itemObj.id as string) || key,
          name: (itemObj.name as string) || (itemObj.label as string) || key,
          badge: (itemObj.badge as string) || null,
          category: (itemObj.category as string) || "main",
        });
      }
    }
    return items.length > 0 ? items : DEFAULT_MODELS;
  }

  return DEFAULT_MODELS;
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<string>("QualAI-1.5");
  const [models, setModels] = useState<ModelItem[]>(DEFAULT_MODELS);

  const getModelLabel = (modelId: string): string => {
    const found = models.find((m) => m.id === modelId || m.name === modelId);
    return found ? found.name : modelId || "QualAI";
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel && storedModel.startsWith("QualAI")) {
      setModel(storedModel);
    } else {
      setModel("QualAI-1.5");
      window.localStorage.setItem(MODEL_STORAGE_KEY, "QualAI-1.5");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadModels = async () => {
      try {
        const data = await fetchAvailableModels();
        if (!isMounted) {
          return;
        }

        const parsedModels = normalizeModels(data.models);
        setModels(parsedModels);
        setModel((prev) => {
          if (prev && parsedModels.some((m) => m.id === prev)) {
            return prev;
          }
          return data.default_model_id || "QualAI-1.5";
        });
      } catch {
        // Keep fallback options.
      }
    };

    void loadModels();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetModel = (newModel: string) => {
    setModel(newModel);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODEL_STORAGE_KEY, newModel);
    }
  };

  return (
    <ModelContext.Provider
      value={{
        model,
        setModel: handleSetModel,
        models,
        getModelLabel,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within ModelProvider");
  }
  return context;
}
