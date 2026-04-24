"use client";

import { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
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

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();

      setIsLoadingUser(true);
      setLoadedFromCache(false);
      setIsRealtimeConnected(false);

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
        await setDoc(userRef, { lastLoginAt: now, updatedAt: now }, { merge: true });
      } catch {}

      unsubscribeSnapshot = onSnapshot(
        userRef,
        async (userSnap) => {
          if (userSnap.exists()) {
            const normalizedUser = normalizeUser(userSnap.data() as Partial<User>, firebaseUser.uid);
            setUser(normalizedUser);
            writeCachedUser(normalizedUser);
            setLoadedFromCache(false);
            setIsRealtimeConnected(true);
            setMessage("Dashboard live synchronisiert.");
            setIsLoadingUser(false);
            return;
          }

          const defaultUser = createDefaultUser(firebaseUser);
          await setDoc(
            userRef,
            {
              ...defaultUser,
              createdAt: now,
              lastLoginAt: now,
              updatedAt: now,
              onboardingCompleted: false,
            },
            { merge: true }
          );

          setUser(defaultUser);
          writeCachedUser(defaultUser);
          setIsRealtimeConnected(true);
          setMessage("Willkommen! Dein WellFit-Profil wurde angelegt.");
          setIsLoadingUser(false);
        },
        () => {
          setIsRealtimeConnected(false);
          setMessage(
            cachedUser
              ? "Offline/Cache aktiv – Realtime Sync nicht verfügbar."
              : "User konnte nicht live geladen werden."
          );
          setIsLoadingUser(false);
        }
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
  };
}
