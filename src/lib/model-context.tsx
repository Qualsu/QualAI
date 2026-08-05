"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAvailableModels } from "@/app/api/chat";

const MODEL_STORAGE_KEY = "chat-model-id";

export function getModelLabel(modelId: string): string {
  switch (modelId) {
    case "qwen3:1.7b":
      return "QualAI-1.5";
    case "qwen3:0.6b":
      return "QualAI-1.5-mini";
    case "qwen2.5:0.5b":
      return "QualAI-1-mini";
    case "qwen2.5:1.5b":
      return "QualAI-1";
    case "qwen2.5-coder:1.5b":
      return "QualAI-Code";
    case "qwen2.5-coder:3b":
      return "QualAI-Code-Max";
    default:
      if (modelId?.toLowerCase().includes("qwen3")) {
        return "QualAI-1.5";
      }
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
  const [model, setModel] = useState("qwen3:1.7b");
  const [models, setModels] = useState<Record<string, string>>({
    "qwen3:1.7b": "QualAI-1.5",
    "qwen3:0.6b": "QualAI-1.5-mini",
    "qwen2.5-coder:1.5b": "QualAI-Code",
    "qwen2.5-coder:3b": "QualAI-Code-Max",
    "qwen2.5:1.5b": "QualAI-1",
    "qwen2.5:0.5b": "QualAI-1-mini",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (
      storedModel &&
      storedModel !== "qwen2.5:1.5b" &&
      storedModel !== "qwen2.5:0.5b"
    ) {
      setModel(storedModel);
    } else {
      setModel("qwen3:1.7b");
      window.localStorage.setItem(MODEL_STORAGE_KEY, "qwen3:1.7b");
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
