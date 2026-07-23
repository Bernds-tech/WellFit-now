"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import ChallengeDetailsPanel from "./ChallengeDetailsPanel";
import ChallengeMapPanel from "./ChallengeMapPanel";
import {
  challengeCategories,
  challenges,
  missionTabs,
  type Challenge,
  type ChallengeCategory,
} from "./challengeData";
import { useChallengeMissionFirebase } from "./useChallengeMissionFirebase";

function reviewStatusLabel(status: string | null | undefined) {
  if (status === "approved") return "Evidence freigegeben";
  if (status === "rejected") return "Evidence abgelehnt";
  if (status === "needs-more-evidence") return "Neue Evidence erforderlich";
  if (status === "pending-server-review") return "Admin-Review offen";
  return "Server-Attempt gestartet";
}

export default function ChallengePage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [message, setMessage] = useState("Die serverseitige Challenge-Projektion wird geladen...");
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>("Wissen & Klarheit");
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(3);
  const challengeState = useChallengeMissionFirebase();

  const filteredChallenges = useMemo(
    () => challenges.filter((challenge) => challenge.category === selectedCategory),
    [selectedCategory],
  );

  useEffect(() => {
    const stillVisible = filteredChallenges.some((challenge) => challenge.id === selectedChallengeId);
    if (!stillVisible && filteredChallenges.length > 0) setSelectedChallengeId(filteredChallenges[0].id);
  }, [filteredChallenges, selectedChallengeId]);

  const selectedChallenge = challenges.find((challenge) => challenge.id === selectedChallengeId) ?? challenges[0];
  const activeAttemptByMission = useMemo(
    () => new Map(challengeState.activeAttempts.map((attempt) => [attempt.missionId, attempt])),
    [challengeState.activeAttempts],
  );
  const selectedAttempt = activeAttemptByMission.get(selectedChallenge.missionId) ?? null;
  const selectedStarted = challengeState.startedMissionIds.includes(selectedChallenge.missionId);
  const selectedCompleted = challengeState.completedMissionIds.includes(selectedChallenge.missionId);
  const selectedBusy = challengeState.busyMissionId === selectedChallenge.missionId;

  const challengeProgress = (challenge: Challenge) => {
    if (challengeState.completedMissionIds.includes(challenge.missionId)) return 100;
    const attempt = activeAttemptByMission.get(challenge.missionId);
    if (attempt?.reviewStatus === "approved") return 80;
    if (attempt?.reviewStatus === "pending-server-review") return 55;
    if (attempt?.reviewStatus === "rejected" || attempt?.reviewStatus === "needs-more-evidence") return 40;
    if (challengeState.startedMissionIds.includes(challenge.missionId)) return 25;
    return 0;
  };

  const toggleFavorite = (missionId: string) => {
    const updated = challengeState.favoriteMissionIds.includes(missionId)
      ? challengeState.favoriteMissionIds.filter((id) => id !== missionId)
      : [...challengeState.favoriteMissionIds, missionId];
    challengeState.setFavoriteMissionIds(updated);
  };

  const prepareRoute = (challenge: Challenge) => {
    setMessage(`Challenge-Route vorbereitet: ${challenge.title}. Die Karte ist nur Bewegungskontext und gewährt weder Abschluss noch WFXP.`);
    window.localStorage.setItem("wellfit-active-challenge", challenge.missionId);
  };

  const continueChallenge = async (challenge: Challenge) => {
    if (!challengeState.userId) {
      setMessage("Bitte melde dich an, um Challenges serverseitig zu starten.");
      return;
    }
    if (challengeState.completedMissionIds.includes(challenge.missionId)) {
      setMessage(`${challenge.title} wurde bereits serverseitig abgeschlossen.`);
      return;
    }

    try {
      const result = await challengeState.continueChallenge(challenge);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Challenge konnte nicht sicher verarbeitet werden.");
    }
  };

  const actionLabel = () => {
    if (selectedCompleted) return "Challenge erledigt";
    if (!challengeState.userId) return "Login erforderlich";
    if (!selectedStarted) return "Challenge starten & bestätigen";
    if (selectedAttempt?.reviewStatus === "approved") return "Freigabe abschließen";
    if (selectedAttempt?.reviewStatus === "rejected" || selectedAttempt?.reviewStatus === "needs-more-evidence") {
      return "Bestätigung erneut einreichen";
    }
    if (selectedAttempt?.reviewStatus === "pending-server-review") return "Reviewstatus prüfen";
    return "Evidence einreichen";
  };

  const serverPathLabel = !challengeState.ready
    ? "Serverprojektion wird geladen"
    : challengeState.progressSource === "server"
      ? "Attempt → Evidence → Admin-Review → Completion → WFXP"
      : "Nur lokale Favoritenanzeige · keine Reward-Autorität";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Challenge</h1>
              <p className="mt-1 text-lg text-cyan-100/90">{challengeState.lastError || message}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/45">{serverPathLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void challengeState.refreshProgress()}
                disabled={!challengeState.userId || selectedBusy}
                className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-4 py-2 text-sm text-white/90 disabled:opacity-40"
              >
                Serverstatus aktualisieren
              </button>
              <Link href="/mobile/analyse" className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold transition hover:bg-orange-400">
                Tracker starten
              </Link>
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">
                Level {challengeState.level} · {challengeState.walletBalance} WFXP
              </div>
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
              isFavorite={challengeState.favoriteMissionIds.includes(selectedChallenge.missionId)}
              progress={challengeProgress(selectedChallenge)}
              isStarted={selectedStarted}
              isCompleted={selectedCompleted}
              reviewStatus={selectedAttempt?.reviewStatus}
              attemptStatus={selectedAttempt?.attemptStatus}
              actionBusy={selectedBusy}
              actionDisabled={!challengeState.ready || !challengeState.userId}
              actionLabel={actionLabel()}
              onToggleFavorite={() => toggleFavorite(selectedChallenge.missionId)}
              onPrepareRoute={() => prepareRoute(selectedChallenge)}
              onContinueChallenge={() => void continueChallenge(selectedChallenge)}
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-[170px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2">
                <p className="text-[10px] uppercase text-white/50">Challenge-Authority</p>
                <p className="mt-1 text-sm font-semibold text-white">{reviewStatusLabel(selectedAttempt?.reviewStatus)}</p>
              </div>
              <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">WFXP-Wallet</p>
                <p className="mt-1 text-lg font-bold text-white">{challengeState.walletBalance}</p>
              </div>
              <div className="min-w-[230px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">Beta-Sicherheitsgrenze</p>
                <p className="mt-1 text-xs font-semibold text-white/70">Server-Review · kein Geldwert · kein Cashout</p>
              </div>
              <div className={`min-w-[190px] rounded-xl border px-3 py-2 text-center ${challengeState.progressSource === "server" ? "border-emerald-400/40 bg-emerald-500/10" : "border-amber-400/40 bg-amber-500/10"}`}>
                <p className={`text-sm font-semibold ${challengeState.progressSource === "server" ? "text-emerald-200" : "text-amber-200"}`}>
                  {challengeState.progressSource === "server" ? "✓ Serverprojektion aktiv" : "⚠ Keine Reward-Autorität"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>X</span><span>in</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
