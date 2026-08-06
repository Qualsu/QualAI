export type ModelItem = {
  id: string;
  name: string;
  badge?: string | null;
  category?: string | null;
};

export type AvailableModelsResponse = {
  default_model_id: string;
  models: Record<string, ModelItem> | ModelItem[];
};

export type ModelContextType = {
  model: string;
  setModel: (model: string) => void;
  models: ModelItem[];
  getModelLabel: (modelId: string) => string;
};
