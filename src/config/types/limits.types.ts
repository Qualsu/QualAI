import React from "react";

export type ModelLimitGroup = "main" | "old";

export type DailyLimitsData = {
  date: string;
  main: number;
  old: number;
};

export type LimitCheckResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  group: ModelLimitGroup;
  groupTitle: string;
};

export type LimitGroupInfo = {
  group: ModelLimitGroup;
  title: string;
  shortTitle: string;
  used: number;
  limit: number;
  remaining: number;
  isExceeded: boolean;
  percentage: number;
};

export type LimitsContextType = {
  limits: DailyLimitsData;
  mainInfo: LimitGroupInfo;
  oldInfo: LimitGroupInfo;
  checkLimit: (modelId: string, category?: string | null) => LimitCheckResult;
  recordUsage: (modelId: string, category?: string | null) => boolean;
  rollbackUsage: (modelId: string, category?: string | null) => void;
  getGroupForModel: (modelId: string, category?: string | null) => ModelLimitGroup;
  getInfoForModel: (modelId: string, category?: string | null) => LimitGroupInfo;
  refreshLimits: () => Promise<void>;
};

export type LimitsProviderProps = {
  children: React.ReactNode;
};
