"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { auth, db } from "@/lib/firebase";
import { recordUserSessionActivity } from "@/lib/beta1/clientUserPreferences";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  createDefaultUser,
  normalizeUser,
  readCachedUser,
  writeCachedUser,
} from "../lib/dashboardUser";

export function useDashboardUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [message, setMessage] = useState("WellFit Profil wird geladen...");
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;
    let disposed = false;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();

      setIsLoadingUser(true);
      setLoadedFromCache(false);
      setIsRealtimeConnected(false);
      setRequiresOnboarding(false);

      if (!firebaseUser) {
        setUser(null);
        setMessage("Nicht eingeloggt.");
        setIsLoadingUser(false);
        return;
      }

      const cachedUser = readCachedUser(firebaseUser.uid);
      if (cachedUser) {
        setUser(cachedUser);
        setLoadedFromCache(true);
        setMessage("Dashboard wird live synchronisiert...");
      }

      try {
        const session = await recordUserSessionActivity("dashboard");
        if (!disposed && session.requiresInitialization) {
          setRequiresOnboarding(true);
          setMessage("Dein Profil ist noch nicht vollständig serverseitig eingerichtet.");
        }
      } catch {
        // Session telemetry is non-authoritative and must never create a fallback profile.
      }

      if (disposed) return;
      const userRef = doc(db, "users", firebaseUser.uid);
      unsubscribeSnapshot = onSnapshot(
        userRef,
        (userSnapshot) => {
          if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            const normalizedUser = normalizeUser(data as Partial<User>, firebaseUser.uid);
            setUser(normalizedUser);
            writeCachedUser(normalizedUser);
            setLoadedFromCache(false);
            setIsRealtimeConnected(true);
            setRequiresOnboarding(data.onboardingCompleted !== true);
            setMessage(
              data.onboardingCompleted === true
                ? "Dashboard live synchronisiert."
                : "Dein Profil ist noch nicht vollständig serverseitig eingerichtet.",
            );
            setIsLoadingUser(false);
            return;
          }

          const readOnlyFallback = createDefaultUser(firebaseUser);
          setUser(readOnlyFallback);
          setLoadedFromCache(false);
          setIsRealtimeConnected(true);
          setRequiresOnboarding(true);
          setMessage("Kein serverseitiges Profil gefunden. Bitte schließe die sichere Registrierung ab.");
          setIsLoadingUser(false);
        },
        () => {
          setIsRealtimeConnected(false);
          setMessage(
            cachedUser
              ? "Offline/Cache aktiv – Realtime Sync nicht verfügbar."
              : "User konnte nicht live geladen werden.",
          );
          setIsLoadingUser(false);
        },
      );
    });

    return () => {
      disposed = true;
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  return {
    user,
    setUser,
    isLoadingUser,
    message,
    setMessage,
    loadedFromCache,
    isRealtimeConnected,
    requiresOnboarding,
  };
}
