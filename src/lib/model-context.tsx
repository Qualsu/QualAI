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
    cleanId === "qualai2" ||
    cleanName === "qualai2"
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
        vision: getVision(id, id),
      }));
    }
    return (dataModels as ModelItem[])
      .filter((m) => m && typeof m === "object" && Boolean(m.id))
      .map((m) => ({
        ...m,
        name: m.name || m.id,
        badge: getBadge(m.id, m.name, m.badge),
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
          badge: getBadge(key, val, null),
          category: getCategory(key, val, null),
          vision: getVision(key, val),
        });
      } else if (val && typeof val === "object") {
        const itemObj = val as Record<string, unknown>;
        const id = (itemObj.id as string) || key;
        const name = (itemObj.name as string) || (itemObj.label as string) || id;
        const givenBadge = (itemObj.badge as string) || null;
        const givenCategory = (itemObj.category as string) || null;
        const givenVision = typeof itemObj.vision === "boolean" ? itemObj.vision : undefined;
        items.push({
          id,
          name,
          badge: getBadge(id, name, givenBadge),
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
  const [model, setModel] = useState<string>("QualAI-2");
  const [models, setModels] = useState<ModelItem[]>(DEFAULT_MODELS);

  const getModelLabel = (modelId: string): string => {
    const found = models.find((m) => m.id === modelId || m.name === modelId);
    return found ? found.name : modelId || "QualAI";
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
    if (storedModel && storedModel.startsWith("QualAI")) {
      setModel(storedModel);
    } else {
      setModel("QualAI-2");
      window.localStorage.setItem(MODEL_STORAGE_KEY, "QualAI-2");
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
          return data.default_model_id || "QualAI-2";
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
