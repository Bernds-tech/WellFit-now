"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import { mergeClientBetaProjection, readClientBetaProjection } from "@/lib/economy/clientBetaProjection";
import type { User } from "@/types/user";
import { appendClientMissionHistory } from "../lib/clientMissionHistory";
import ChallengeDetailsPanel from "./ChallengeDetailsPanel";
import ChallengeMapPanel from "./ChallengeMapPanel";
import { challengeCategories, challenges, missionTabs, type Challenge, type ChallengeCategory } from "./challengeData";
import { fetchChallengeRewardCompletion } from "./serverChallengeEconomyApi";

const createUserFromProjection = (fallbackUser: User | null): User | null => {
  const projection = readClientBetaProjection(fallbackUser?.id ?? null);
  if (!projection) return fallbackUser;

  return {
    ...(fallbackUser ?? {
      id: projection.userId,
      firstName: "",
      lastName: "",
      email: "",
      energy: projection.avatar.energy,
      currency: "points" as const,
      inventory: [],
    }),
    id: fallbackUser?.id ?? projection.userId,
    points: projection.points,
    xp: projection.xp,
    level: projection.level,
    stepsToday: projection.stepsToday,
    avatar: projection.avatar,
  };
};

export default function ChallengePage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Challenges?");
  const [serverPathLabel, setServerPathLabel] = useState("Reward Preview · Completion · Projection · Buddy-Sync bereit");
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>("Wissen & Klarheit");
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(3);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-challenges");
    let parsedUser: User | null = null;

    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser) as User;
      } catch (error) {
        console.error("Fehler beim Laden des Users", error);
      }
    }

    setUser(createUserFromProjection(parsedUser));

    if (savedFavorites) {
      try {
        setFavoriteIds(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Fehler beim Laden der Challenge-Favoriten", error);
      }
    }
  }, []);

  const filteredChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.category === selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    const stillVisible = filteredChallenges.some((challenge) => challenge.id === selectedChallengeId);
    if (!stillVisible && filteredChallenges.length > 0) setSelectedChallengeId(filteredChallenges[0].id);
  }, [filteredChallenges, selectedChallengeId]);

  const selectedChallenge = challenges.find((challenge) => challenge.id === selectedChallengeId) ?? challenges[0];

  const toggleFavorite = (challengeId: number) => {
    const updated = favoriteIds.includes(challengeId)
      ? favoriteIds.filter((id) => id !== challengeId)
      : [...favoriteIds, challengeId];
    setFavoriteIds(updated);
    localStorage.setItem("wellfit-favorite-challenges", JSON.stringify(updated));
  };

  const syncUserFromProjection = (nextUserId: string) => {
    const nextUser = createUserFromProjection(user ?? {
      id: nextUserId,
      firstName: "",
      lastName: "",
      email: "",
      points: 0,
      xp: 0,
      energy: 100,
      level: 1,
      stepsToday: 0,
      currency: "points",
      avatar: { hunger: 100, mood: 100, energy: 100, level: 1 },
      inventory: [],
    });

    if (nextUser) {
      setUser(nextUser);
      localStorage.setItem("wellfit-user", JSON.stringify(nextUser));
    }
  };

  const prepareRoute = (challenge: Challenge) => {
    setMessage(`Challenge-Route vorbereitet: ${challenge.title}. Standort dient als Bewegungskontext, keine Token/NFTs.`);
    localStorage.setItem("wellfit-active-challenge", JSON.stringify(challenge.id));
  };

  const completeChallenge = async (challenge: Challenge) => {
    const projection = readClientBetaProjection(user?.id ?? null);
    const userId = user?.id ?? projection?.userId ?? "challenge-local-beta-user";
    const currentPoints = projection?.points ?? user?.points ?? 0;
    const currentXp = projection?.xp ?? user?.xp ?? 0;
    const currentLevel = projection?.level ?? user?.level ?? 1;
    const currentAvatar = projection?.avatar ?? user?.avatar ?? { hunger: 100, mood: 100, energy: 100, level: currentLevel };
    const completedKey = `wellfit-challenge-${challenge.id}-completed`;

    if (localStorage.getItem(completedKey)) {
      setMessage(`Challenge bereits abgeschlossen: ${challenge.title}`);
      return;
    }

    const completion = await fetchChallengeRewardCompletion({ userId, mission: challenge, currentPoints, currentXp, currentLevel });

    if (completion.status === "completion_blocked") {
      setMessage(`${challenge.title} wurde servernah blockiert. Keine Punkte vorgemerkt.`);
      setServerPathLabel(`Reward Preview: ${completion.rewardPreviewStatus}`);
      return;
    }

    if (completion.status === "manual_review_required") {
      setMessage(`${challenge.title} wurde für Review vorgemerkt. Keine direkte Punktegutschrift.`);
      setServerPathLabel(`Reward Preview: ${completion.rewardPreviewStatus}`);
      return;
    }

    mergeClientBetaProjection(userId, {
      points: completion.projectedPoints,
      xp: completion.projectedXp,
      level: currentLevel,
      avatar: {
        ...currentAvatar,
        energy: Math.max(0, (currentAvatar.energy ?? 100) - 2),
        hunger: Math.max(0, (currentAvatar.hunger ?? 100) - 1),
      },
      source: "mission_completion",
    });

    localStorage.setItem(completedKey, "true");
    appendClientMissionHistory({
      id: `challenge-${challenge.id}-${new Date().toISOString().slice(0, 10)}`,
      title: challenge.title,
      category: "Challenge",
      rewardLabel: `+${completion.approvedPointsPreview} interne Punkte`,
      completedAt: new Date().toISOString(),
      icon: challenge.icon,
      pointsDelta: completion.approvedPointsPreview,
      status: "geschafft",
    });
    setMessage(`${challenge.title} abgeschlossen: +${completion.approvedPointsPreview} interne Punkte. ${completion.message} ${completion.buddySyncMessage}`);
    setServerPathLabel(
      completion.draftCollections.length > 0
        ? `Challenge-Drafts: ${completion.draftCollections.slice(0, 4).join(" · ")}`
        : "Reward Preview · Completion · Projection im Fallback",
    );
    syncUserFromProjection(userId);
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Challenge</h1>
              <p className="mt-1 text-lg text-cyan-100/90">{message}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/45">{serverPathLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-4 py-2 text-sm text-white/90">Synchron</button>
              <button className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold">Tracker starten</button>
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Flammi LVL {user?.avatar?.level ?? 1}</div>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {missionTabs.map((tab) => tab.label === "Challenge" ? (
                <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">
                  {tab.label}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
                </div>
              ) : (
                <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>
              ))}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_0.95fr] gap-4 overflow-hidden pb-20">
            <ChallengeMapPanel
              categories={challengeCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              challenges={filteredChallenges}
              selectedChallengeId={selectedChallengeId}
              onSelectChallenge={setSelectedChallengeId}
            />
            <ChallengeDetailsPanel
              challenge={selectedChallenge}
              isFavorite={favoriteIds.includes(selectedChallenge.id)}
              onToggleFavorite={() => toggleFavorite(selectedChallenge.id)}
              onPrepareRoute={() => prepareRoute(selectedChallenge)}
              onCompleteChallenge={() => completeChallenge(selectedChallenge)}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
