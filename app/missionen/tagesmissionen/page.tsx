"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@/types/user";
import { completeMission } from "@/lib/missionCompletion";
import { listenUserFavorites, toggleMissionFavorite } from "@/lib/missionFavorites";
import { finishTrackingSession, startTrackingSession } from "@/lib/tracking";
import { createBrowserStepCounter } from "@/lib/stepCounter";
import { createAiMissionForCurrentUser } from "@/lib/aiMissionGenerator";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

// ... (rest bleibt unverändert bis useEffect missions)

export default function MissionenPage() {
  // ... existing state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // ... existing effects

  // 🔥 NEU: Automatische KI Missionen
  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || isGeneratingAi) return;

    const aiMissions = missions.filter(m => m.source === "ai");

    if (aiMissions.length >= 3) return;

    const generate = async () => {
      setIsGeneratingAi(true);

      try {
        const needed = 3 - aiMissions.length;

        for (let i = 0; i < needed; i++) {
          await createAiMissionForCurrentUser({
            level: user?.level ?? 1,
            stepsToday: liveSteps,
            goal: "abnehmen",
            lastTargetValue: 10 + i,
            adaptiveLimit: 30,
            recentSuccessRate: 0.7,
            progressIndex: completedMissionIds.length,
            slotIndex: i
          });
        }
      } catch (e) {
        console.error("KI Missionen konnten nicht erzeugt werden", e);
      } finally {
        setIsGeneratingAi(false);
      }
    };

    generate();
  }, [missions, user, liveSteps, completedMissionIds]);

  // ... rest bleibt unverändert
}
