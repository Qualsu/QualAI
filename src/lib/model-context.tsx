"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchAvailableModels } from "@/app/api/chat";
import type { ModelItem } from "@/config/types";
import { DEFAULT_MODELS, MODEL_STORAGE_KEY } from "@/config/const/model-context.const";
import type { ModelContextType } from "@/config/types";


const ModelContext = createContext<ModelContextType | undefined>(undefined);

function getBadge(id: string, name?: string, givenBadge?: string | null): string | null {
  if (givenBadge && typeof givenBadge === "string" && givenBadge.trim() !== "") {
    return givenBadge.trim();
  }

  const cleanId = (id || "").toLowerCase().replace(/[-_\s]/g, "");
  const cleanName = (name || "").toLowerCase().replace(/[-_\s]/g, "");

  if (cleanId.includes("micro") || cleanName.includes("micro")) {
    return "Fast";
  }

  if (
    cleanId === "qualai15" ||
    cleanName === "qualai15"
  ) {
    return "Best";
  }

  const def = DEFAULT_MODELS.find((m) => {
    const defId = m.id.toLowerCase().replace(/[-_\s]/g, "");
    const defName = m.name.toLowerCase().replace(/[-_\s]/g, "");
    return defId === cleanId || defName === cleanName || defId === cleanName || defName === cleanId;
  });

  return def?.badge || null;
}

function getCategory(id: string, name?: string, givenCategory?: string | null): string {
  if (givenCategory && typeof givenCategory === "string" && givenCategory.trim() !== "") {
    return givenCategory.trim();
  }
  const cleanId = (id || "").toLowerCase().replace(/[-_\s]/g, "");
  if (cleanId === "qualai1" || cleanId === "qualai1mini" || cleanId === "qualai15micro") {
    return "old";
  }
  return "main";
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
        badge: getBadge(id, id, null),
        category: getCategory(id, id, null),
      }));
    }
    return (dataModels as ModelItem[])
      .filter((m) => m && typeof m === "object" && Boolean(m.id))
      .map((m) => ({
        ...m,
        name: m.name || m.id,
        badge: getBadge(m.id, m.name, m.badge),
        category: getCategory(m.id, m.name, m.category),
      }));
  }

  if (typeof dataModels === "object") {
    const items: ModelItem[] = [];
    for (const [key, val] of Object.entries(dataModels)) {
      if (typeof val === "string") {
        items.push({
          id: key,
          name: val,
          badge: getBadge(key, val, null),
          category: getCategory(key, val, null),
        });
      } else if (val && typeof val === "object") {
        const itemObj = val as Record<string, unknown>;
        const id = (itemObj.id as string) || key;
        const name = (itemObj.name as string) || (itemObj.label as string) || id;
        const givenBadge = (itemObj.badge as string) || null;
        const givenCategory = (itemObj.category as string) || null;
        items.push({
          id,
          name,
          badge: getBadge(id, name, givenBadge),
          category: getCategory(id, name, givenCategory),
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
