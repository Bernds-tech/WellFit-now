"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
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

      const userRef = doc(db, "users", firebaseUser.uid);
      const now = new Date().toISOString();

      try {
        const initialSnapshot = await getDoc(userRef);
        if (initialSnapshot.exists()) {
          await setDoc(userRef, { lastLoginAt: now, updatedAt: now }, { merge: true });
        }
      } catch {
        // A failed activity timestamp must never create a fallback profile or economy state.
      }

      unsubscribeSnapshot = onSnapshot(
        userRef,
        (userSnapshot) => {
          if (userSnapshot.exists()) {
            const normalizedUser = normalizeUser(userSnapshot.data() as Partial<User>, firebaseUser.uid);
            setUser(normalizedUser);
            writeCachedUser(normalizedUser);
            setLoadedFromCache(false);
            setIsRealtimeConnected(true);
            setRequiresOnboarding(userSnapshot.data().onboardingCompleted !== true);
            setMessage(
              userSnapshot.data().onboardingCompleted === true
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
