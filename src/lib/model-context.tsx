"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAvailableModels } from "@/app/api/chat";

const MODEL_STORAGE_KEY = "chat-model-id";

export function getModelLabel(modelId: string): string {
  switch (modelId) {
    case "qwen2.5:0.5b":
      return "QualAI-1-mini";
    case "qwen2.5:1.5b":
      return "QualAI-1";
    case "qwen2.5-coder:1.5b":
      return "QualAI-Code";
    case "qwen2.5-coder:3b":
      return "QualAI-Code-Max";
    default:
      if (modelId?.toLowerCase().includes("qwen")) {
        return "QualAI-1";
      }
      return modelId || "QualAI";
  }
}

type ModelContextType = {
  model: string;
  setModel: (model: string) => void;
  models: Record<string, string>;
  getModelLabel: (modelId: string) => string;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState("qwen2.5:1.5b");
  const [models, setModels] = useState<Record<string, string>>({
    "qwen2.5:0.5b": "QualAI-1-mini",
    "qwen2.5:1.5b": "QualAI-1",
    "qwen2.5-coder:1.5b": "QualAI-Code",
    "qwen2.5-coder:3b": "QualAI-Code-Max",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (storedModel) {
      setModel(storedModel);
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

        setModels(data.models);
        setModel((prev) => {
          if (prev && data.models[prev]) {
            return prev;
          }
          return data.default_model_id;
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
