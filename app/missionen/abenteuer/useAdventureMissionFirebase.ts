"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchAdventureProgress,
  reconcileAdventureAttempt,
  startAdventureAccess,
  submitAdventureForReview,
  type Beta1AdventureActiveAttempt,
  type Beta1AdventureActionResult,
  type Beta1AdventureAccessResult,
  type Beta1AdventureProgress,
} from "@/lib/beta1/clientAdventureMissionProgress";
import {
  fetchNearbyMissionLocations,
  type Beta1NearbyMissionLocation,
} from "@/lib/beta1/clientNearbyMissionLocations";
import { adventures, type Adventure } from "./adventureData";

export type AdventureMissionState = {
  userId: string | null;
  ready: boolean;
  lastError: string | null;
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1AdventureActiveAttempt[];
  walletBalance: number;
  lifetimeSpent: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressSource: "server" | "unavailable";
  busyMissionId: string | null;
  nearbyLocations: Beta1NearbyMissionLocation[];
  locationReady: boolean;
  locationLoading: boolean;
  locationError: string | null;
  locationRadiusKm: number;
  locationAccuracyMeters: number | null;
  origin: { latitude: number; longitude: number } | null;
};

function emptyState(userId: string | null, ready = false): AdventureMissionState {
  return {
    userId,
    ready,
    lastError: null,
    startedMissionIds: [],
    completedMissionIds: [],
    activeAttempts: [],
    walletBalance: 0,
    lifetimeSpent: 0,
    xp: 0,
    level: 1,
    xpForCurrentLevel: 0,
    xpForNextLevel: 100,
    walletAvailable: false,
    progressSource: "unavailable",
    busyMissionId: null,
    nearbyLocations: [],
    locationReady: false,
    locationLoading: false,
    locationError: null,
    locationRadiusKm: 25,
    locationAccuracyMeters: null,
    origin: null,
  };
}

function applyProgress(
  current: AdventureMissionState,
  progress: Beta1AdventureProgress,
  userId: string,
): AdventureMissionState {
  return {
    ...current,
    userId,
    ready: true,
    lastError: null,
    startedMissionIds: progress.startedMissionIds,
    completedMissionIds: progress.completedMissionIds,
    activeAttempts: progress.activeAttempts,
    walletBalance: progress.walletBalance,
    lifetimeSpent: progress.lifetimeSpent,
    xp: progress.xp,
    level: progress.level,
    xpForCurrentLevel: progress.xpForCurrentLevel,
    xpForNextLevel: progress.xpForNextLevel,
    walletAvailable: progress.walletAvailable,
    progressSource: "server",
  };
}

export function useAdventureMissionFirebase() {
  const [state, setState] = useState<AdventureMissionState>(() => emptyState(null, false));

  const refreshProgress = useCallback(async (userId?: string | null) => {
    const resolvedUserId = userId ?? auth.currentUser?.uid ?? null;
    if (!resolvedUserId) return null;
    const progress = await fetchAdventureProgress();
    setState((current) => applyProgress(current, progress, resolvedUserId));
    return progress;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState(emptyState(null, true));
        return;
      }
      if (!cancelled) setState(emptyState(user.uid, false));
      try {
        const progress = await fetchAdventureProgress();
        if (!cancelled) setState((current) => applyProgress(current, progress, user.uid));
      } catch (error) {
        if (!cancelled) {
          setState({
            ...emptyState(user.uid, true),
            lastError: error instanceof Error ? error.message : "Abenteuerfortschritt konnte nicht geladen werden.",
          });
        }
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const loadNearbyLocations = useCallback(async (radiusKm = 25) => {
    if (!state.userId) throw new Error("Bitte melde dich an, um Abenteuer in deiner Umgebung zu laden.");
    if (state.locationLoading) return state.nearbyLocations;
    setState((current) => ({
      ...current,
      locationLoading: true,
      locationError: null,
      locationRadiusKm: radiusKm,
    }));
    try {
      const result = await fetchNearbyMissionLocations({
        radiusKm,
        missionIds: adventures.map((adventure) => adventure.missionId),
      });
      setState((current) => ({
        ...current,
        nearbyLocations: result.locations,
        locationReady: true,
        locationLoading: false,
        locationError: null,
        locationRadiusKm: result.radiusKm,
        locationAccuracyMeters: result.accuracyMeters,
        origin: {
          latitude: result.origin.latitude,
          longitude: result.origin.longitude,
        },
      }));
      return result.locations;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Abenteuerorte in deiner Umgebung konnten nicht geladen werden.";
      setState((current) => ({
        ...current,
        nearbyLocations: [],
        locationReady: true,
        locationLoading: false,
        locationError: message,
      }));
      throw error;
    }
  }, [state.locationLoading, state.nearbyLocations, state.userId]);

  const runMissionAction = useCallback(async <T,>(
    missionId: string,
    action: () => Promise<T>,
  ): Promise<T> => {
    if (!state.userId) throw new Error("Bitte melde dich an, um ein Abenteuer zu verwenden.");
    if (state.busyMissionId) throw new Error("Ein Abenteuer wird bereits verarbeitet.");
    setState((current) => ({ ...current, busyMissionId: missionId, lastError: null }));
    try {
      const result = await action();
      await refreshProgress(state.userId);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Abenteuer konnte nicht verarbeitet werden.";
      setState((current) => ({ ...current, lastError: message }));
      throw error;
    } finally {
      setState((current) => ({ ...current, busyMissionId: null }));
    }
  }, [refreshProgress, state.busyMissionId, state.userId]);

  const activateAccess = useCallback((
    adventure: Adventure,
    location: Beta1NearbyMissionLocation,
  ): Promise<Beta1AdventureAccessResult> => runMissionAction(
    adventure.missionId,
    () => startAdventureAccess(adventure, location),
  ), [runMissionAction]);

  const submitForReview = useCallback((adventure: Adventure): Promise<Beta1AdventureActionResult> => runMissionAction(
    adventure.missionId,
    () => submitAdventureForReview(adventure),
  ), [runMissionAction]);

  const continueAdventure = useCallback((adventure: Adventure): Promise<Beta1AdventureActionResult> => {
    const activeAttempt = state.activeAttempts.find((attempt) => attempt.missionId === adventure.missionId);
    if (!activeAttempt) {
      return submitForReview(adventure);
    }
    return runMissionAction(
      adventure.missionId,
      () => reconcileAdventureAttempt(adventure, activeAttempt),
    );
  }, [runMissionAction, state.activeAttempts, submitForReview]);

  return {
    ...state,
    loadNearbyLocations,
    refreshProgress,
    activateAccess,
    submitForReview,
    continueAdventure,
  };
}