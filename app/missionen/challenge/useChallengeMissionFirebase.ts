"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  fetchChallengeProgress,
  reconcileChallengeAttempt,
  submitChallengeForReview,
  type Beta1ChallengeActionResult,
  type Beta1ChallengeActiveAttempt,
  type Beta1ChallengeProgress,
} from "@/lib/beta1/clientChallengeMissionProgress";
import {
  fetchNearbyMissionLocations,
  type Beta1NearbyMissionLocation,
} from "@/lib/beta1/clientNearbyMissionLocations";
import { challenges, type Challenge } from "./challengeData";

export type ChallengeMissionState = {
  favoriteMissionIds: string[];
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1ChallengeActiveAttempt[];
  userId: string | null;
  ready: boolean;
  lastError: string | null;
  walletBalance: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressSource: "server" | "local";
  busyMissionId: string | null;
  nearbyLocations: Beta1NearbyMissionLocation[];
  locationReady: boolean;
  locationLoading: boolean;
  locationError: string | null;
  locationRadiusKm: number;
  locationAccuracyMeters: number | null;
  origin: { latitude: number; longitude: number } | null;
};

const localStorageKey = (userId?: string | null) => `wellfit-challenge-favorites:${userId ?? "guest"}`;

function readLocalFavorites(userId?: string | null): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function writeLocalFavorites(userId: string | null, favoriteMissionIds: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localStorageKey(userId), JSON.stringify(favoriteMissionIds));
}

function emptyState(userId: string | null, ready = false): ChallengeMissionState {
  return {
    favoriteMissionIds: readLocalFavorites(userId),
    startedMissionIds: [],
    completedMissionIds: [],
    activeAttempts: [],
    userId,
    ready,
    lastError: null,
    walletBalance: 0,
    xp: 0,
    level: 1,
    xpForCurrentLevel: 0,
    xpForNextLevel: 100,
    walletAvailable: false,
    progressSource: "local",
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

function stateFromProjection(
  current: ChallengeMissionState,
  projection: Beta1ChallengeProgress,
  userId: string,
  favoriteMissionIds: string[],
): ChallengeMissionState {
  return {
    ...current,
    favoriteMissionIds,
    startedMissionIds: projection.startedMissionIds,
    completedMissionIds: projection.completedMissionIds,
    activeAttempts: projection.activeAttempts,
    userId,
    ready: true,
    lastError: null,
    walletBalance: projection.walletBalance,
    xp: projection.xp,
    level: projection.level,
    xpForCurrentLevel: projection.xpForCurrentLevel,
    xpForNextLevel: projection.xpForNextLevel,
    walletAvailable: projection.walletAvailable,
    progressSource: "server",
  };
}

export function useChallengeMissionFirebase() {
  const [state, setState] = useState<ChallengeMissionState>(() => emptyState(null, false));

  const refresh = useCallback(async (userId: string) => {
    const projection = await fetchChallengeProgress();
    setState((current) => stateFromProjection(
      current,
      projection,
      userId,
      current.userId === userId ? current.favoriteMissionIds : readLocalFavorites(userId),
    ));
    return projection;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) setState(emptyState(null, true));
        return;
      }
      const favorites = readLocalFavorites(user.uid);
      if (!cancelled) setState({ ...emptyState(user.uid, false), favoriteMissionIds: favorites });
      try {
        const projection = await fetchChallengeProgress();
        if (cancelled) return;
        setState((current) => stateFromProjection(current, projection, user.uid, favorites));
      } catch (error) {
        if (cancelled) return;
        setState({
          ...emptyState(user.uid, true),
          favoriteMissionIds: favorites,
          lastError: error instanceof Error ? error.message : "Challenges konnten nicht geladen werden.",
        });
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const setFavoriteMissionIds = useCallback((favoriteMissionIds: string[]) => {
    writeLocalFavorites(state.userId, favoriteMissionIds);
    setState((current) => ({ ...current, favoriteMissionIds }));
  }, [state.userId]);

  const loadNearbyLocations = useCallback(async (radiusKm = 25) => {
    if (!state.userId) throw new Error("Bitte melde dich an, um Challenges in deiner Umgebung zu laden.");
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
        missionIds: challenges.map((challenge) => challenge.missionId),
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
      const message = error instanceof Error ? error.message : "Challenge-Orte in deiner Umgebung konnten nicht geladen werden.";
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

  const runChallengeAction = useCallback(async (
    challenge: Challenge,
    action: () => Promise<Beta1ChallengeActionResult>,
  ) => {
    if (!state.userId) throw new Error("Bitte melde dich an, um Challenges zu starten.");
    if (state.busyMissionId) throw new Error("Eine Challenge wird bereits verarbeitet.");
    setState((current) => ({ ...current, busyMissionId: challenge.missionId, lastError: null }));
    try {
      const result = await action();
      await refresh(state.userId);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Challenge konnte nicht verarbeitet werden.";
      setState((current) => ({ ...current, lastError: message }));
      throw error;
    } finally {
      setState((current) => ({ ...current, busyMissionId: null }));
    }
  }, [refresh, state.busyMissionId, state.userId]);

  const continueChallenge = useCallback(async (
    challenge: Challenge,
    location: Beta1NearbyMissionLocation | null,
  ) => {
    const activeAttempt = state.activeAttempts.find((attempt) => attempt.missionId === challenge.missionId);
    if (!activeAttempt) {
      if (!location) throw new Error("Wähle zuerst einen veröffentlichten Challenge-Ort in deiner Umgebung.");
      return runChallengeAction(challenge, () => submitChallengeForReview(challenge, location));
    }
    const matchingLocation = location?.locationId === activeAttempt.locationId
      ? location
      : state.nearbyLocations.find((item) => item.locationId === activeAttempt.locationId) ?? null;
    return runChallengeAction(
      challenge,
      () => reconcileChallengeAttempt(challenge, activeAttempt, matchingLocation),
    );
  }, [runChallengeAction, state.activeAttempts, state.nearbyLocations]);

  const refreshProgress = useCallback(async () => {
    if (!state.userId) return null;
    return refresh(state.userId);
  }, [refresh, state.userId]);

  return {
    ...state,
    setFavoriteMissionIds,
    loadNearbyLocations,
    continueChallenge,
    refreshProgress,
  };
}
