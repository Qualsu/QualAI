"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@clerk/nextjs";
import { useModel } from "@/lib/model-context";
import { fetchServerLimits } from "@/app/api/chat";
import {
  DAILY_LIMIT_MAIN,
  DAILY_LIMIT_OLD,
  DAILY_LIMITS_UPDATED_EVENT,
  LIMIT_GROUP_SHORT_TITLES,
  LIMIT_GROUP_TITLES,
  LIMITS_STORAGE_KEY_PREFIX,
} from "@/config/const/limits.const";
import type {
  DailyLimitsData,
  LimitCheckResult,
  LimitGroupInfo,
  LimitsContextType,
  LimitsProviderProps,
  ModelLimitGroup,
} from "@/config/types";

const LimitsContext = createContext<LimitsContextType | undefined>(undefined);

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStorageKey(accountId: string): string {
  return `${LIMITS_STORAGE_KEY_PREFIX}${accountId}`;
}

function resolveModelLimitGroup(
  modelId: string,
  category?: string | null
): ModelLimitGroup {
  if (category === "old") return "old";
  if (category === "main") return "main";

  const clean = (modelId || "").toLowerCase().replace(/[-_\s.]/g, "");
  if (clean === "qai3" || clean === "qai3mini") {
    return "main";
  }
  if (clean.startsWith("qualai")) {
    return "old";
  }
  return "main";
}

function getStoredLimits(accountId: string): DailyLimitsData {
  const today = getTodayDateString();
  if (typeof window === "undefined") {
    return { date: today, main: 0, old: 0 };
  }
  try {
    const raw = window.localStorage.getItem(getStorageKey(accountId));
    if (!raw) {
      return { date: today, main: 0, old: 0 };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.date === today) {
      return {
        date: today,
        main: typeof parsed.main === "number" ? Math.max(0, parsed.main) : 0,
        old: typeof parsed.old === "number" ? Math.max(0, parsed.old) : 0,
      };
    }
  } catch {
    // fallback
  }
  return { date: today, main: 0, old: 0 };
}

function saveStoredLimits(accountId: string, data: DailyLimitsData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getStorageKey(accountId), JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent(DAILY_LIMITS_UPDATED_EVENT, { detail: data })
    );
  } catch {
    // ignore
  }
}

export function LimitsProvider({ children }: LimitsProviderProps) {
  const { user } = useUser();
  const { models } = useModel();
  const accountId = user?.id ?? "guest";

  const [limits, setLimits] = useState<DailyLimitsData>(() =>
    getStoredLimits(accountId)
  );

  const syncFromStorage = useCallback(() => {
    setLimits(getStoredLimits(accountId));
  }, [accountId]);

  const refreshLimits = useCallback(async () => {
    try {
      const data = await fetchServerLimits(accountId);
      if (data?.daily) {
        const serverData: DailyLimitsData = {
          date: data.daily.date,
          main: data.daily.main.used,
          old: data.daily.old.used,
        };
        saveStoredLimits(accountId, serverData);
        setLimits(serverData);
      }
    } catch {
      // Keep cached state if server is momentarily unreachable
    }
  }, [accountId]);

  useEffect(() => {
    syncFromStorage();
    void refreshLimits();

    const handleCustomUpdate = () => {
      syncFromStorage();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getStorageKey(accountId)) {
        syncFromStorage();
      }
    };

    const handleFocus = () => {
      void refreshLimits();
    };

    window.addEventListener(DAILY_LIMITS_UPDATED_EVENT, handleCustomUpdate);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );
    const msUntilMidnight = Math.max(1000, nextMidnight.getTime() - now.getTime());
    const timeoutId = window.setTimeout(() => {
      void refreshLimits();
    }, msUntilMidnight);

    return () => {
      window.removeEventListener(DAILY_LIMITS_UPDATED_EVENT, handleCustomUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.clearTimeout(timeoutId);
    };
  }, [accountId, syncFromStorage, refreshLimits]);


  const getGroupForModel = useCallback(
    (modelId: string, category?: string | null): ModelLimitGroup => {
      if (category) {
        return resolveModelLimitGroup(modelId, category);
      }
      const found = models.find(
        (m) =>
          m.id.toLowerCase() === modelId.toLowerCase() ||
          m.name.toLowerCase() === modelId.toLowerCase()
      );
      return resolveModelLimitGroup(modelId, found?.category ?? null);
    },
    [models]
  );

  const checkLimit = useCallback(
    (modelId: string, category?: string | null): LimitCheckResult => {
      const group = getGroupForModel(modelId, category);
      const current = getStoredLimits(accountId);
      const limit = group === "main" ? DAILY_LIMIT_MAIN : DAILY_LIMIT_OLD;
      const used = current[group];
      const remaining = Math.max(0, limit - used);
      const allowed = remaining > 0;

      return {
        allowed,
        remaining,
        limit,
        used,
        group,
        groupTitle: LIMIT_GROUP_TITLES[group],
      };
    },
    [accountId, getGroupForModel]
  );

  const recordUsage = useCallback(
    (modelId: string, category?: string | null): boolean => {
      const group = getGroupForModel(modelId, category);
      const current = getStoredLimits(accountId);
      const limit = group === "main" ? DAILY_LIMIT_MAIN : DAILY_LIMIT_OLD;

      if (current[group] >= limit) {
        return false;
      }

      const nextData: DailyLimitsData = {
        date: getTodayDateString(),
        main: group === "main" ? current.main + 1 : current.main,
        old: group === "old" ? current.old + 1 : current.old,
      };

      saveStoredLimits(accountId, nextData);
      setLimits(nextData);
      return true;
    },
    [accountId, getGroupForModel]
  );

  const rollbackUsage = useCallback(
    (modelId: string, category?: string | null) => {
      const group = getGroupForModel(modelId, category);
      const current = getStoredLimits(accountId);

      const nextData: DailyLimitsData = {
        date: current.date,
        main: group === "main" ? Math.max(0, current.main - 1) : current.main,
        old: group === "old" ? Math.max(0, current.old - 1) : current.old,
      };

      saveStoredLimits(accountId, nextData);
      setLimits(nextData);
    },
    [accountId, getGroupForModel]
  );

  const mainRemaining = Math.max(0, DAILY_LIMIT_MAIN - limits.main);
  const mainInfo: LimitGroupInfo = useMemo(
    () => ({
      group: "main",
      title: LIMIT_GROUP_TITLES.main,
      shortTitle: LIMIT_GROUP_SHORT_TITLES.main,
      used: limits.main,
      limit: DAILY_LIMIT_MAIN,
      remaining: mainRemaining,
      isExceeded: mainRemaining <= 0,
      percentage: Math.min(
        100,
        Math.round((mainRemaining / DAILY_LIMIT_MAIN) * 100)
      ),
    }),
    [limits.main, mainRemaining]
  );

  const oldRemaining = Math.max(0, DAILY_LIMIT_OLD - limits.old);
  const oldInfo: LimitGroupInfo = useMemo(
    () => ({
      group: "old",
      title: LIMIT_GROUP_TITLES.old,
      shortTitle: LIMIT_GROUP_SHORT_TITLES.old,
      used: limits.old,
      limit: DAILY_LIMIT_OLD,
      remaining: oldRemaining,
      isExceeded: oldRemaining <= 0,
      percentage: Math.min(
        100,
        Math.round((oldRemaining / DAILY_LIMIT_OLD) * 100)
      ),
    }),
    [limits.old, oldRemaining]
  );

  const getInfoForModel = useCallback(
    (modelId: string, category?: string | null): LimitGroupInfo => {
      const group = getGroupForModel(modelId, category);
      return group === "main" ? mainInfo : oldInfo;
    },
    [getGroupForModel, mainInfo, oldInfo]
  );

  return (
    <LimitsContext.Provider
      value={{
        limits,
        mainInfo,
        oldInfo,
        checkLimit,
        recordUsage,
        rollbackUsage,
        getGroupForModel,
        getInfoForModel,
        refreshLimits,
      }}
    >
      {children}
    </LimitsContext.Provider>
  );
}

export function useLimits(): LimitsContextType {
  const context = useContext(LimitsContext);
  if (!context) {
    throw new Error("useLimits must be used within LimitsProvider");
  }
  return context;
}
