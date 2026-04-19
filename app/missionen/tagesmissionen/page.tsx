"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { completeMission, startMission } from "@/lib/missionCompletion";
import { listenUserFavorites, toggleMissionFavorite } from "@/lib/missionFavorites";
import { finishTrackingSession, startTrackingSession } from "@/lib/tracking";
import { createBrowserStepCounter } from "@/lib/stepCounter";
import { createAiMissionForCurrentUser } from "@/lib/aiMissionGenerator";
import { calculateRewardMultipliers } from "@/lib/avatarMultiplier";
import { calculateDynamicRewardScore } from "@/lib/rewardScore";
import { economyConfig, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

type MissionTab = "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | "Favoriten" | "History";
type Mission = { id: string; numericId: number; title: string; reward: number; baseReward?: number; category: MissionTab; difficulty: "Leicht" | "Mittel" | "Schwer"; description: string; duration: string; type: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer"; targetValue?: number; unit?: "steps" | "minutes" | "questions" | "checkin" | string; aiPersonalized?: boolean; source?: "firestore" | "fallback" | "ai"; };
type MissionProgress = { missionId: string; status: string; progressValue: number; pointsGranted?: number; lockedRewardPoints?: number; avatarMultiplier?: number; userEconomyMultiplier?: number; systemRewardRate?: number; precisionFactor?: number; socialMultiplier?: number; streakMultiplier?: number; sponsorMultiplier?: number; integrityMultiplier?: number; multiplierReasons?: string[]; };
type RewardPreview = { finalReward: number; systemRewardRate: number; avatarMultiplier: number; userEconomyMultiplier: number; precisionFactor: number; socialMultiplier: number; streakMultiplier: number; sponsorMultiplier: number; integrityMultiplier: number; validationRisk: number; reasons: string[]; };

const tabs: MissionTab[] = ["Tagesmissionen", "Wochenmissionen", "Abenteuer", "Challenge", "Wettkämpfe", "Favoriten", "History"];
const tabHref = (tab: MissionTab) => tab === "Tagesmissionen" ? "/missionen/tagesmissionen" : tab === "Wochenmissionen" ? "/missionen/wochenmissionen" : tab === "Abenteuer" ? "/missionen/abenteuer" : tab === "Challenge" ? "/missionen/challenge" : tab === "Wettkämpfe" ? "/missionen/wettkaempfe" : tab === "Favoriten" ? "/missionen/favoriten" : "/missionen/history";
const missionIcon = (type: Mission["type"]) => type === "Bewegung" ? "👣" : type === "Ernährung" ? "💧" : type === "Workout" ? "🔥" : type === "Community" ? "👥" : "🗺️";

const fallbackMissions: Mission[] = [
  { id: "fallback-daily-steps", numericId: 1, title: "Tägliche Schritte", reward: 25, baseReward: 25, category: "Tagesmissionen", difficulty: "Leicht", description: "Erreiche heute 5.000 Schritte und halte deinen Bewegungsfluss aktiv.", duration: "1 Tag", type: "Bewegung", targetValue: 5000, unit: "steps", aiPersonalized: true, source: "fallback" },
  { id: "fallback-daily-water", numericId: 2, title: "Wasser trinken", reward: 10, baseReward: 10, category: "Tagesmissionen", difficulty: "Leicht", description: "Trinke heute mindestens 2 Liter Wasser für deinen Energiehaushalt.", duration: "1 Tag", type: "Ernährung", targetValue: 1, unit: "checkin", aiPersonalized: true, source: "fallback" },
  { id: "fallback-daily-workout", numericId: 3, title: "Workout Boost", reward: 40, baseReward: 40, category: "Tagesmissionen", difficulty: "Mittel", description: "Absolviere ein 20-minütiges Workout und verdiene Extra-Punkte.", duration: "20 Minuten", type: "Workout", targetValue: 20, unit: "minutes", aiPersonalized: true, source: "fallback" },
];

const normalizeMission = (docId: string, data: any, index: number): Mission => ({
  id: docId,
  numericId: typeof data.numericId === "number" ? data.numericId : index + 1,
  title: String(data.title ?? "KI Mission"),
  reward: Number(data.pointsReward ?? data.reward ?? data.baseRewardPoints ?? 0),
  baseReward: Number(data.baseRewardPoints ?? data.baseReward ?? data.pointsReward ?? data.reward ?? 0),
  category: String(data.category ?? data.displayCategory ?? "Tagesmissionen") as MissionTab,
  difficulty: (data.difficulty === "Schwer" || data.difficulty === "Mittel" || data.difficulty === "Leicht") ? data.difficulty : "Leicht",
  description: String(data.description ?? "Diese Mission wurde dynamisch vorbereitet."),
  duration: String(data.duration ?? data.timeWindow ?? "1 Tag"),
  type: (data.type === "Ernährung" || data.type === "Workout" || data.type === "Community" || data.type === "Abenteuer" || data.type === "Bewegung") ? data.type : "Bewegung",
  targetValue: Number(data.targetValue ?? (data.unit === "steps" ? 5000 : 1)),
  unit: String(data.unit ?? (data.type === "Bewegung" ? "steps" : "checkin")),
  aiPersonalized: Boolean(data.aiPersonalized ?? data.generatedByAi ?? true),
  source: data.generatedByAi ? "ai" : "firestore",
});

const formatMultiplier = (value?: number) => `×${Number(value ?? 1).toFixed(2)}`;
const multiplierColor = (value?: number) => Number(value ?? 1) > 1 ? "text-green-300" : Number(value ?? 1) < 1 ? "text-red-300" : "text-white/70";
const pointsDeltaLabel = (base: number, finalReward: number) => {
  const delta = finalReward - base;
  if (delta > 0) return `+${delta} durch Boni`;
  if (delta < 0) return `${delta} durch Dämpfung`;
  return "kein Auf- oder Abschlag";
};

function buildBehaviorHints(preview: RewardPreview | null, progress?: MissionProgress) {
  const avatarMultiplier = progress?.avatarMultiplier ?? preview?.avatarMultiplier ?? 1;
  const userEconomyMultiplier = progress?.userEconomyMultiplier ?? preview?.userEconomyMultiplier ?? 1;
  const systemRewardRate = progress?.systemRewardRate ?? preview?.systemRewardRate ?? 1;
  const reasons = progress?.multiplierReasons ?? preview?.reasons ?? [];
  const hints: string[] = [];
  if (systemRewardRate < 1) hints.push("Die Hauptwallet ist aktuell knapper gefüllt. Dadurch ist der Systemfaktor niedriger.");
  if (systemRewardRate > 1) hints.push("Die Hauptwallet ist gut gefüllt. Dadurch ist der Systemfaktor aktuell höher.");
  if (avatarMultiplier > 1) hints.push("Dein Avatar ist in gutem Zustand und verstärkt den Reward.");
  if (avatarMultiplier < 1) hints.push("Pflege deinen Avatar besser, damit dein Reward-Multiplikator steigt.");
  if (userEconomyMultiplier < 1) hints.push("Dein System erkennt aktuell Horten. Wer Punkte nutzt, stabilisiert seinen persönlichen Reward besser.");
  if (userEconomyMultiplier > 1) hints.push("Du nutzt das Ökosystem aktiv. Das gibt dir einen kleinen persönlichen Bonus.");
  return [...reasons, ...hints].slice(0, 4);
}

export default function MissionenPage() {
  const [brightness, setBrightness] = useState(100);
  const [activeTab, setActiveTab] = useState<MissionTab>("Tagesmissionen");
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>("fallback-daily-steps");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [missionProgressById, setMissionProgressById] = useState<Record<string, MissionProgress>>({});
  const [missions, setMissions] = useState<Mission[]>(fallbackMissions);
  const [message, setMessage] = useState("Bereit für KI-personalisierte Quests?");
  const [missionSourceMessage, setMissionSourceMessage] = useState("Fallback-Missionen aktiv – Firestore wird verbunden...");
  const [isSavingCompletion, setIsSavingCompletion] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [liveSteps, setLiveSteps] = useState(0);
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [rewardPreview, setRewardPreview] = useState<RewardPreview | null>(null);
  const stepCounterRef = useRef<ReturnType<typeof createBrowserStepCounter> | null>(null);

  useEffect(() => { const savedHistory = localStorage.getItem("wellfit-mission-history"); if (savedHistory) { try { setHistoryIds(JSON.parse(savedHistory)); } catch {} } }, []);

  useEffect(() => {
    const missionsQuery = query(collection(db, "missions"), where("active", "==", true), where("category", "==", "Tagesmissionen"), orderBy("sortOrder", "asc"));
    return onSnapshot(missionsQuery, (snapshot) => {
      const firestoreMissions = snapshot.docs.map((docSnap, index) => normalizeMission(docSnap.id, docSnap.data(), index));
      if (firestoreMissions.length > 0) {
        setMissions(firestoreMissions);
        setSelectedMissionId((current) => current && firestoreMissions.some((mission) => mission.id === current) ? current : firestoreMissions[0].id);
        setMissionSourceMessage("Firestore Live · KI-Missionen und Reward Score aktiv");
      } else {
        setMissions(fallbackMissions);
        setMissionSourceMessage("Noch keine aktiven Firestore-Missionen – Fallback aktiv");
      }
    }, () => { setMissions(fallbackMissions); setMissionSourceMessage("Firestore Missionen nicht verfügbar – Fallback aktiv"); });
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) { setMissionProgressById({}); setCompletedMissionIds([]); setFavoriteIds([]); return; }
      const unsubscribeFavorites = listenUserFavorites(firebaseUser.uid, (favorites) => setFavoriteIds(favorites.map((favorite) => favorite.missionId)));
      const progressQuery = query(collection(db, "userMissionProgress"), where("userId", "==", firebaseUser.uid));
      const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
        const progressMap: Record<string, MissionProgress> = {};
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const missionId = String(data.missionId ?? "");
          if (!missionId) return;
          progressMap[missionId] = {
            missionId,
            status: String(data.status ?? "open"),
            progressValue: Number(data.progressValue ?? 0),
            pointsGranted: Number(data.pointsGranted ?? 0),
            lockedRewardPoints: Number(data.lockedRewardPoints ?? 0),
            avatarMultiplier: Number(data.avatarMultiplier ?? 1),
            userEconomyMultiplier: Number(data.userEconomyMultiplier ?? 1),
            systemRewardRate: Number(data.systemRewardRate ?? data.rewardRateAtStart ?? 1),
            precisionFactor: Number(data.precisionFactor ?? 1),
            socialMultiplier: Number(data.socialMultiplier ?? 1),
            streakMultiplier: Number(data.streakMultiplier ?? 1),
            sponsorMultiplier: Number(data.sponsorMultiplier ?? 1),
            integrityMultiplier: Number(data.integrityMultiplier ?? 1),
            multiplierReasons: Array.isArray(data.multiplierReasons) ? data.multiplierReasons.map(String) : [],
          };
        });
        setMissionProgressById(progressMap);
        setCompletedMissionIds(Object.values(progressMap).filter((progress) => progress.status === "completed").map((progress) => progress.missionId));
      });
      return () => { unsubscribeFavorites(); unsubscribeProgress(); };
    });
  }, []);

  const filteredMissions = useMemo(() => activeTab === "Favoriten" ? missions.filter((mission) => favoriteIds.includes(mission.id)) : activeTab === "History" ? missions.filter((mission) => historyIds.includes(mission.id)) : missions.filter((mission) => mission.category === activeTab), [activeTab, favoriteIds, historyIds, missions]);
  useEffect(() => { if (filteredMissions.length === 0) { setSelectedMissionId(null); return; } if (!filteredMissions.some((mission) => mission.id === selectedMissionId)) setSelectedMissionId(filteredMissions[0].id); }, [filteredMissions, selectedMissionId]);

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? null;
  const selectedProgress = selectedMission ? missionProgressById[selectedMission.id] : undefined;
  const targetSteps = selectedMission?.unit === "steps" ? selectedMission.targetValue ?? 5000 : 0;
  const stepProgressPercent = targetSteps > 0 ? Math.min(100, Math.round((liveSteps / targetSteps) * 100)) : selectedProgress?.progressValue ?? 0;
  const dailyMissions = missions.filter((mission) => mission.category === "Tagesmissionen");
  const favoriteMissions = missions.filter((mission) => favoriteIds.includes(mission.id));

  useEffect(() => {
    const calculatePreview = async () => {
      if (!selectedMission || !auth.currentUser) { setRewardPreview(null); return; }
      if (selectedProgress?.lockedRewardPoints) { setRewardPreview(null); return; }
      const multipliers = await calculateRewardMultipliers(auth.currentUser.uid);
      const systemRewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply);
      const score = calculateDynamicRewardScore({ baseReward: selectedMission.baseReward ?? selectedMission.reward, systemRewardRate, avatarMultiplier: multipliers.avatarMultiplier, userEconomyMultiplier: multipliers.userEconomyMultiplier });
      setRewardPreview({ finalReward: score.finalReward, systemRewardRate, avatarMultiplier: multipliers.avatarMultiplier, userEconomyMultiplier: multipliers.userEconomyMultiplier, precisionFactor: score.precisionFactor, socialMultiplier: score.socialMultiplier, streakMultiplier: score.streakMultiplier, sponsorMultiplier: score.sponsorMultiplier, integrityMultiplier: score.integrityMultiplier, validationRisk: score.validationRisk, reasons: multipliers.reasons });
    };
    calculatePreview();
  }, [selectedMission, selectedProgress?.lockedRewardPoints]);

  useEffect(() => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || isGeneratingAi) return;
    const aiMissions = missions.filter((m) => m.source === "ai");
    if (aiMissions.length >= 3) return;
    const generate = async () => {
      setIsGeneratingAi(true);
      try {
        for (let i = 0; i < 3 - aiMissions.length; i++) {
          await createAiMissionForCurrentUser({ level: 1, stepsToday: liveSteps, goal: "abnehmen", lastTargetValue: 10 + i, adaptiveLimit: 30, recentSuccessRate: 0.7, progressIndex: completedMissionIds.length, slotIndex: i });
        }
      } catch (e) { console.error("KI Missionen konnten nicht erzeugt werden", e); }
      finally { setIsGeneratingAi(false); }
    };
    generate();
  }, [missions, liveSteps, completedMissionIds, isGeneratingAi]);

  const toggleFavorite = async (mission: Mission) => { const isFavorite = favoriteIds.includes(mission.id); try { await toggleMissionFavorite({ missionId: mission.id, title: mission.title, category: mission.category, description: mission.description, rewardPoints: mission.reward, rewardLabel: `+${mission.reward} Punkte`, icon: missionIcon(mission.type), sourcePath: "/missionen/tagesmissionen", source: mission.source ?? "prefab" }, isFavorite); } catch (error) { setMessage(error instanceof Error ? error.message : "Favorit konnte nicht gespeichert werden."); } };
  const startSelectedMission = async () => { if (!selectedMission) return; try { const result = await startMission({ missionId: selectedMission.id, title: selectedMission.title, category: selectedMission.category, rewardPoints: selectedMission.baseReward ?? selectedMission.reward, missionKind: `${selectedMission.category}_${selectedMission.unit}_${selectedMission.title.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "_")}`, icon: missionIcon(selectedMission.type), proofType: selectedMission.unit === "steps" ? "steps" : "manual" }); setMessage(`Reward fixiert: +${result.lockedReward} Punkte`); } catch (error) { setMessage(error instanceof Error ? error.message : "Mission konnte nicht gestartet werden."); } };
  const completeSelectedMission = async () => { if (!selectedMission) return; setIsSavingCompletion(true); try { const result = await completeMission({ missionId: selectedMission.id, title: selectedMission.title, category: selectedMission.category, rewardPoints: selectedMission.baseReward ?? selectedMission.reward, missionKind: `${selectedMission.category}_${selectedMission.unit}_${selectedMission.title.toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "_")}`, icon: missionIcon(selectedMission.type), proofType: selectedMission.unit === "steps" ? "steps" : "manual" }); setMessage(`Mission abgeschlossen: +${result.pointsGranted} Punkte`); const nextHistoryIds = Array.from(new Set([selectedMission.id, ...historyIds])); setHistoryIds(nextHistoryIds); localStorage.setItem("wellfit-mission-history", JSON.stringify(nextHistoryIds)); } catch (error) { setMessage(error instanceof Error ? error.message : "Mission konnte nicht gespeichert werden."); } finally { setIsSavingCompletion(false); } };
  const handleStartStepTracking = async () => { if (!selectedMission) return; await startSelectedMission(); const counter = createBrowserStepCounter({ onUpdate: (update) => { setLiveSteps(update.steps); if (selectedMission.unit === "steps" && selectedMission.targetValue && update.steps >= selectedMission.targetValue) completeSelectedMission(); }, onError: (msg) => setMessage(msg) }); const sessionId = await startTrackingSession({ source: "mobile", missionId: selectedMission.id, missionTitle: selectedMission.title, activityType: selectedMission.unit === "steps" ? "steps" : "manual" }); stepCounterRef.current = counter; setTrackingSessionId(sessionId); setLiveSteps(0); const started = await counter.start(); if (!started) { setTrackingSessionId(null); setMessage("Step Counter konnte nicht gestartet werden."); return; } setTrackingActive(true); setMessage("Tracking läuft. Reward wurde beim Start fixiert."); };
  const handleStopStepTracking = async () => { const countedSteps = stepCounterRef.current?.stop() ?? liveSteps; if (trackingSessionId) await finishTrackingSession({ sessionId: trackingSessionId, stepsAggregated: countedSteps, eventsCount: 1, notes: "Browser DeviceMotion Step Counter" }); setTrackingActive(false); setTrackingSessionId(null); };
  const handlePrimaryAction = async () => { if (selectedProgress?.status === "completed") return; if (!selectedProgress?.lockedRewardPoints) { if (selectedMission?.unit === "steps") return handleStartStepTracking(); return startSelectedMission(); } if (selectedMission?.unit === "steps" && trackingActive) return handleStopStepTracking(); return completeSelectedMission(); };

  const currentReward = selectedProgress?.lockedRewardPoints || rewardPreview?.finalReward || selectedMission?.reward || 0;
  const rewardBase = selectedMission?.baseReward ?? selectedMission?.reward ?? 0;
  const behaviorHints = buildBehaviorHints(rewardPreview, selectedProgress);

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="object-contain" priority /></div>
          <nav className="space-y-2 text-[14px]"><Link href="/dashboard" className="block text-white/80">Dashboard</Link><div className="font-bold text-orange-400">Missionen</div><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto pt-4"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block text-white/80">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-4 border-t border-cyan-400/10 pt-3"><button className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div>
        </aside>
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between"><div><h1 className="text-5xl font-extrabold leading-none">Tagesmissionen</h1><p className="mt-1 text-lg text-cyan-100/90">{message}</p><p className="mt-1 text-xs text-cyan-100/65">{missionSourceMessage}</p></div><div className="flex items-center gap-2"><button onClick={selectedMission?.unit === "steps" ? handleStartStepTracking : startSelectedMission} className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold">Tracker starten</button><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Flammi LVL 1</div></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">{tabs.map((tab) => activeTab === tab ? <div key={tab} className="relative pb-1 text-base font-semibold text-orange-400">{tab}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div> : <Link key={tab} href={tabHref(tab)} onClick={() => setActiveTab(tab)} className="pb-1 text-base text-white/85 hover:text-white">{tab}</Link>)}</div></div>
          <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-4 overflow-hidden pb-20">
            <div className="min-h-0 space-y-4 overflow-y-auto pr-3 pb-5">
              <div className="rounded-[20px] border border-cyan-300/20 bg-[#053841]/90 px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"><div className="flex items-center justify-between"><div><p className="text-lg font-semibold text-white">Heute zählt Balance: Bewegung, Lernen und gesunde Routine</p><p className="mt-1 text-sm text-yellow-400">→ KI-Buddy merkt sich später deine Muster und schlägt passende Ziele vor</p></div><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-yellow-400/30 bg-[#0a3d46] text-2xl">🧠</div></div></div>
              <div className="grid grid-cols-3 gap-4">{dailyMissions.slice(0, 3).map((mission) => (<div key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className={`cursor-pointer rounded-[20px] border p-4 transition ${selectedMissionId === mission.id ? "border-yellow-400 bg-[#07505c]" : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"}`}><div className="mb-3 flex items-start justify-between"><div className="text-3xl">{missionIcon(mission.type)}</div><button onClick={(e) => { e.stopPropagation(); toggleFavorite(mission); }} className={`text-xl ${favoriteIds.includes(mission.id) ? "text-yellow-400" : "text-white/30"}`}>★</button></div><h3 className="text-lg font-bold leading-tight text-white">{mission.title}</h3><p className="mt-2 text-sm text-white/80">{mission.description}</p><div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300" style={{ width: selectedMissionId === mission.id ? `${stepProgressPercent}%` : "0%" }} /></div><div className="mt-2 flex items-center justify-between text-xs text-white/80"><span>{mission.duration}</span><span>+{mission.reward} Punkte</span></div><button className="mt-4 w-full rounded-lg border border-yellow-400/40 bg-[#0a3d46] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#0e4c57]">Fortsetzen</button></div>))}</div>
              <div><h2 className="mb-3 text-xl font-bold text-white">Missions-Pool</h2><div className="grid grid-cols-4 gap-3">{filteredMissions.map((mission) => { const isCompleted = missionProgressById[mission.id]?.status === "completed"; return (<div key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className={`cursor-pointer rounded-[20px] border p-4 ${selectedMissionId === mission.id ? "border-yellow-400 bg-[#07505c]" : "border-cyan-300/10 bg-[#053841]/90"}`}><div className="mb-2 flex justify-between"><div className="text-2xl">{missionIcon(mission.type)}</div><button onClick={(e) => { e.stopPropagation(); toggleFavorite(mission); }} className={`text-lg ${favoriteIds.includes(mission.id) ? "text-yellow-400" : "text-white/30"}`}>★</button></div><p className="text-base font-bold">{mission.title}</p><p className="mt-1 text-xs text-white/60">{mission.type} · {mission.difficulty}</p><p className="mt-3 text-sm font-semibold text-orange-400">+ {mission.reward} aktuell</p>{isCompleted && <p className="mt-2 text-xs font-semibold text-green-300">Erledigt</p>}</div>); })}</div></div>
              <div><h2 className="mb-3 text-xl font-bold text-yellow-400">Deine Favoriten</h2><div className="flex gap-3 overflow-x-auto pb-2">{favoriteMissions.length ? favoriteMissions.map((mission) => <div key={mission.id} onClick={() => setSelectedMissionId(mission.id)} className="min-w-[140px] cursor-pointer rounded-[20px] border border-yellow-400/30 bg-[#053841]/90 p-3 text-sm">★ {mission.title}</div>) : <div className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/40">Noch keine Favoriten</div>}</div></div>
            </div>
            <div className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">{selectedMission ? (<><div className="mb-4 flex items-start justify-between gap-3"><h2 className="text-2xl font-bold text-white">Missionsdetails</h2><button onClick={() => toggleFavorite(selectedMission)} className={`text-2xl ${favoriteIds.includes(selectedMission.id) ? "text-yellow-400" : "text-white/30"}`}>★</button></div><div className="mb-3 flex justify-center text-4xl">{missionIcon(selectedMission.type)}</div><h3 className="text-center text-2xl font-bold text-white">{selectedMission.title}</h3><p className="mt-3 text-center text-sm text-white/85">{selectedMission.description}</p><div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm text-white/80"><span>{selectedMission.unit === "steps" ? "Live Schritte" : "Fortschritt"}</span><span>{selectedMission.unit === "steps" ? `${liveSteps}/${targetSteps}` : `${selectedProgress?.progressValue ?? 0}%`}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300" style={{ width: selectedProgress?.status === "completed" ? "100%" : `${stepProgressPercent}%` }} /></div></div><div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3"><div className="flex items-center justify-between text-base"><span className="font-semibold text-white/90">Aktueller Reward</span><span className="font-bold text-yellow-400">+{currentReward} Punkte</span></div><p className="mt-1 text-xs text-white/60">{selectedProgress?.lockedRewardPoints ? "Reward ist fixiert." : "Wird beim Start fixiert."}</p><p className="mt-1 text-xs text-cyan-100/70">{pointsDeltaLabel(rewardBase, currentReward)}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/75"><span>Basis</span><span className="text-right">{rewardBase}</span><span>System</span><span className={`text-right ${multiplierColor(selectedProgress?.systemRewardRate ?? rewardPreview?.systemRewardRate)}`}>{formatMultiplier(selectedProgress?.systemRewardRate ?? rewardPreview?.systemRewardRate)}</span><span>Avatar</span><span className={`text-right ${multiplierColor(selectedProgress?.avatarMultiplier ?? rewardPreview?.avatarMultiplier)}`}>{formatMultiplier(selectedProgress?.avatarMultiplier ?? rewardPreview?.avatarMultiplier)}</span><span>User</span><span className={`text-right ${multiplierColor(selectedProgress?.userEconomyMultiplier ?? rewardPreview?.userEconomyMultiplier)}`}>{formatMultiplier(selectedProgress?.userEconomyMultiplier ?? rewardPreview?.userEconomyMultiplier)}</span></div></div><div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4"><h4 className="text-sm font-bold text-cyan-100">KI-Buddy Hinweis</h4><div className="mt-2 space-y-2 text-xs text-cyan-50/90">{behaviorHints.length > 0 ? behaviorHints.map((hint, index) => <p key={index}>• {hint}</p>) : <p>• Heute klein anfangen ist besser als gar nicht starten. Ich merke mir später, was dich wirklich motiviert.</p>}</div></div><button onClick={handlePrimaryAction} disabled={isSavingCompletion || selectedProgress?.status === "completed"} className={`mt-5 w-full rounded-xl px-4 py-3 font-bold ${selectedProgress?.status === "completed" ? "bg-green-700/70" : "bg-blue-600 hover:bg-blue-700"}`}>{selectedProgress?.status === "completed" ? "Mission erledigt" : selectedProgress?.lockedRewardPoints ? "Mission abschließen" : "Mission starten & Reward fixieren"}</button></>) : <div className="flex h-full items-center justify-center text-white/40">Wähle eine Mission</div>}</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Letzter Login: Heute 9:43</p><p className="mt-1 text-sm font-semibold text-white">3 WFT erhalten</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Reward Score</p><p className="mt-1 text-lg font-bold text-white">{currentReward}</p></div><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Live Schritte</p><p className="mt-1 text-sm font-semibold text-white/70">{liveSteps}</p></div><div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center"><p className="text-sm font-semibold text-yellow-400">Erledigt: {completedMissionIds.length}</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
