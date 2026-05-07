"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultPinnedDashboardCardIds, type DashboardCardSize } from "../lib/dashboardCards";

export type DashboardCardDimensions = {
  width: number;
  height: number;
};

export type DashboardPreferences = {
  pinnedCardIds: string[];
  cardSizes: Partial<Record<string, DashboardCardSize>>;
  cardDimensions: Partial<Record<string, DashboardCardDimensions>>;
};

const STORAGE_KEY = "wellfit-dashboard-preferences-v1";

export const defaultDashboardPreferences: DashboardPreferences = {
  pinnedCardIds: defaultPinnedDashboardCardIds,
  cardSizes: {},
  cardDimensions: {},
};

function normalizePreferences(value: Partial<DashboardPreferences> | null | undefined): DashboardPreferences {
  return {
    pinnedCardIds: Array.isArray(value?.pinnedCardIds) && value.pinnedCardIds.length > 0 ? value.pinnedCardIds : defaultPinnedDashboardCardIds,
    cardSizes: value?.cardSizes ?? {},
    cardDimensions: value?.cardDimensions ?? {},
  };
}

function readPreferences(): DashboardPreferences {
  if (typeof window === "undefined") return defaultDashboardPreferences;

  try {
    const rawPreferences = window.localStorage.getItem(STORAGE_KEY);
    return rawPreferences ? normalizePreferences(JSON.parse(rawPreferences)) : defaultDashboardPreferences;
  } catch (error) {
    console.error("Fehler beim Laden der Dashboard-Einstellungen", error);
    return defaultDashboardPreferences;
  }
}

function writePreferences(preferences: DashboardPreferences) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Fehler beim Speichern der Dashboard-Einstellungen", error);
  }
}

export function useDashboardPreferences() {
  const [preferences, setPreferences] = useState<DashboardPreferences>(defaultDashboardPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPreferences(readPreferences());
      setIsLoaded(true);
    });
  }, []);

  const setDashboardPreferences = useCallback((updater: DashboardPreferences | ((current: DashboardPreferences) => DashboardPreferences)) => {
    setPreferences((currentPreferences) => {
      const nextPreferences = typeof updater === "function" ? updater(currentPreferences) : updater;
      const normalizedPreferences = normalizePreferences(nextPreferences);
      writePreferences(normalizedPreferences);
      return normalizedPreferences;
    });
  }, []);

  const resetDashboardPreferences = useCallback(() => {
    setDashboardPreferences(defaultDashboardPreferences);
  }, [setDashboardPreferences]);

  return { preferences, isLoaded, setDashboardPreferences, resetDashboardPreferences };
}

