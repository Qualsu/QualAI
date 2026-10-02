"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAvailableModels } from "@/app/api/chat";
import type { ModelItem } from "@/config/types";
import { DEFAULT_MODELS, MODEL_STORAGE_KEY } from "@/config/const/model-context.const";
import type { ModelContextType } from "@/config/types";


const ModelContext = createContext<ModelContextType | undefined>(undefined);

function getVision(id: string, name?: string, givenVision?: boolean): boolean {
  if (typeof givenVision === "boolean") {
    return givenVision;
  }
  const cleanId = (id || "").toLowerCase().replace(/[-_\s]/g, "");
  const cleanName = (name || "").toLowerCase().replace(/[-_\s]/g, "");
  return (
    cleanId === "qualai2" ||
    cleanName === "qualai2" ||
    cleanId === "qualai2code" ||
    cleanName === "qualai2code" ||
    cleanId === "qualaicode2" ||
    cleanName === "qualaicode2"
  );
}

function getCategory(id: string, name?: string, givenCategory?: string | null): string {
  if (givenCategory && typeof givenCategory === "string" && givenCategory.trim() !== "") {
    return givenCategory.trim();
  }
  const cleanId = (id || "").toLowerCase().replace(/[-_\s.]/g, "");
  if (
    cleanId === "qai3" ||
    cleanId === "qai3mini"
  ) {
    return "main";
  }
  return "old";
}

function normalizeModels(dataModels: unknown): ModelItem[] {
  if (!dataModels) {
    return DEFAULT_MODELS;
  }

  if (Array.isArray(dataModels)) {
    if (dataModels.length === 0) return DEFAULT_MODELS;
    if (typeof dataModels[0] === "string") {
      return (dataModels as string[]).map((id) => ({
        id,
        name: id,
        category: getCategory(id, id, null),
        vision: getVision(id, id),
      }));
    }
    return (dataModels as ModelItem[])
      .filter((m) => m && typeof m === "object" && Boolean(m.id))
      .map((m) => ({
        ...m,
        name: m.name || m.id,
        category: getCategory(m.id, m.name, m.category),
        vision: getVision(m.id, m.name, m.vision),
      }));
  }

  if (typeof dataModels === "object") {
    const items: ModelItem[] = [];
    for (const [key, val] of Object.entries(dataModels)) {
      if (typeof val === "string") {
        items.push({
          id: key,
          name: val,
          category: getCategory(key, val, null),
          vision: getVision(key, val),
        });
      } else if (val && typeof val === "object") {
        const itemObj = val as Record<string, unknown>;
        const id = (itemObj.id as string) || key;
        const name = (itemObj.name as string) || (itemObj.label as string) || id;
        const givenCategory = (itemObj.category as string) || null;
        const givenVision = typeof itemObj.vision === "boolean" ? itemObj.vision : undefined;
        items.push({
          id,
          name,
          category: getCategory(id, name, givenCategory),
          vision: getVision(id, name, givenVision),
        });
      }
    }
    return items.length > 0 ? items : DEFAULT_MODELS;
  }

  return DEFAULT_MODELS;
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<string>("qai-3");
  const [models, setModels] = useState<ModelItem[]>(DEFAULT_MODELS);

  const getModelLabel = (modelId: string): string => {
    const found = models.find((m) => m.id === modelId || m.name === modelId);
    return found ? found.name : modelId || "Q.AI";
  };

  const isVisionSupported = (modelId?: string): boolean => {
    const targetId = modelId || model;
    const found = models.find(
      (m) =>
        m.id.toLowerCase() === targetId.toLowerCase() ||
        m.name.toLowerCase() === targetId.toLowerCase()
    );
    if (found && typeof found.vision === "boolean") {
      return found.vision;
    }
    return getVision(targetId, targetId);
  };

  const isCurrentModelVision = isVisionSupported(model);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedModel = window.localStorage.getItem(MODEL_STORAGE_KEY);
    if (
      storedModel &&
      (storedModel.startsWith("QualAI") ||
        storedModel.startsWith("qai-") ||
        storedModel.startsWith("Q.AI"))
    ) {
      setModel(storedModel);
    } else {
      setModel("qai-3");
      window.localStorage.setItem(MODEL_STORAGE_KEY, "qai-3");
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
          return data.default_model_id || "qai-3";
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
        isVisionSupported,
        isCurrentModelVision,
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
