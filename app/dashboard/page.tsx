"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import { economyConfig, getPriceRate, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const getDashboardCacheKey = (uid: string) => `wellfit-dashboard-user-${uid}`;
const createDefaultUser = (firebaseUser: { uid: string; email: string | null; displayName: string | null; }): User => ({ id: firebaseUser.uid, firstName: firebaseUser.displayName?.split(" ")[0] ?? "", lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "", email: firebaseUser.email ?? "", points: 0, xp: 0, energy: 100, level: 1, stepsToday: 0, currency: "points", avatar: { hunger: 100, mood: 100, energy: 100, level: 1 }, inventory: [] });
const normalizeUser = (rawUser: Partial<User>, userId: string): User => ({ ...rawUser as User, id: userId, firstName: rawUser.firstName ?? "", lastName: rawUser.lastName ?? "", email: rawUser.email ?? "", points: rawUser.points ?? 0, xp: rawUser.xp ?? 0, energy: rawUser.energy ?? 100, level: rawUser.level ?? 1, stepsToday: rawUser.stepsToday ?? 0, currency: rawUser.currency ?? "points", avatar: { hunger: rawUser.avatar?.hunger ?? 100, mood: rawUser.avatar?.mood ?? 100, energy: rawUser.avatar?.energy ?? 100, level: rawUser.avatar?.level ?? rawUser.level ?? 1 }, inventory: rawUser.inventory ?? [] });
const readCachedUser = (uid: string): User | null => { try { const cached = localStorage.getItem(getDashboardCacheKey(uid)); return cached ? normalizeUser(JSON.parse(cached) as Partial<User>, uid) : null; } catch { return null; } };
const writeCachedUser = (user: User) => { try { localStorage.setItem(getDashboardCacheKey(user.id), JSON.stringify(user)); } catch {} };
const label = (value?: string) => ({ loseWeight: "Abnehmen", fitness: "Fitness", health: "Gesundheit", adventure: "Abenteuer", walking: "Gehen", running: "Laufen", cycling: "Radfahren", dancing: "Tanzen", workout: "Workout", relax: "Entspannung" } as Record<string,string>)[value ?? ""] ?? "Bewegung";

function getPersonalMission(user: any) {
  const profile = user?.profile ?? {};
  const activity = profile.activity ?? {};
  const vitals = profile.vitals ?? {};
  const goals: string[] = activity.goals ?? profile.goals ?? [];
  const activities: string[] = activity.activities ?? profile.activities ?? [profile.activityType ?? "walking"];
  const mainGoal = goals[0] ?? "health";
  const mainActivity = activities[0] ?? "walking";
  const beginner = activity.activityLevel === "Einsteiger" || profile.fitnessLevel === "beginner";
  const steps = beginner ? 1500 : mainActivity === "running" ? 2500 : mainActivity === "cycling" ? 3000 : 2000;
  const title = mainGoal === "loseWeight" ? "Flammi Fatburn Start" : mainGoal === "adventure" ? "Flammi Entdeckerpfad" : mainGoal === "fitness" ? "Flammi Power Start" : "Flammi Balance Start";
  const focus = mainGoal === "loseWeight" ? "leichte Aktivierung und Fettstoffwechsel" : mainGoal === "adventure" ? "Bewegung mit Entdecken" : mainGoal === "fitness" ? "Kraft, Ausdauer und Energie" : "gesunde Routine und Wohlbefinden";
  return { title, steps, activity: label(mainActivity), goal: label(mainGoal), focus, reward: beginner ? 20 : 35, note: vitals.sleepQuality === "Schlecht" ? "Heute sanft starten: Schlaf war nicht optimal." : "Guter Startpunkt für deine erste Routine." };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [buddyLevel, setBuddyLevel] = useState(1);
  const [stepsToday, setStepsToday] = useState(0);
  const [buddyEnergy, setBuddyEnergy] = useState(100);
  const [buddyHunger, setBuddyHunger] = useState(100);
  const [message, setMessage] = useState("WellFit Profil wird geladen...");
  const [trackingActive, setTrackingActive] = useState(false);
  const [permissions, setPermissions] = useState({ location: false });
  const [foodPrice, setFoodPrice] = useState(5);
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const mission = useMemo(() => getPersonalMission(user), [user]);

  useEffect(() => {
    const savedPermissions = localStorage.getItem("wellfit-permissions");
    if (savedPermissions) { try { const parsed = JSON.parse(savedPermissions); setPermissions({ location: !!parsed.location }); } catch {} }
    let unsubscribeSnapshot: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      setIsLoadingUser(true); setLoadedFromCache(false); setIsRealtimeConnected(false);
      if (!firebaseUser) { setUser(null); setMessage("Nicht eingeloggt."); setIsLoadingUser(false); return; }
      const cachedUser = readCachedUser(firebaseUser.uid);
      if (cachedUser) { setUser(cachedUser); setLoadedFromCache(true); setMessage("Dashboard wird live synchronisiert..."); }
      const userRef = doc(db, "users", firebaseUser.uid);
      const now = new Date().toISOString();
      try { await setDoc(userRef, { lastLoginAt: now, updatedAt: now }, { merge: true }); } catch {}
      unsubscribeSnapshot = onSnapshot(userRef, async (userSnap) => {
        if (userSnap.exists()) { const normalizedUser = normalizeUser(userSnap.data() as Partial<User>, firebaseUser.uid); setUser(normalizedUser); writeCachedUser(normalizedUser); setLoadedFromCache(false); setIsRealtimeConnected(true); setMessage("Dashboard live synchronisiert."); setIsLoadingUser(false); return; }
        const defaultUser = createDefaultUser(firebaseUser);
        await setDoc(userRef, { ...defaultUser, createdAt: now, lastLoginAt: now, updatedAt: now, onboardingCompleted: false }, { merge: true });
        setUser(defaultUser); writeCachedUser(defaultUser); setIsRealtimeConnected(true); setMessage("Willkommen! Dein WellFit-Profil wurde angelegt."); setIsLoadingUser(false);
      }, () => { setIsRealtimeConnected(false); setMessage(cachedUser ? "Offline/Cache aktiv – Realtime Sync nicht verfügbar." : "User konnte nicht live geladen werden."); setIsLoadingUser(false); });
    });
    return () => { if (unsubscribeSnapshot) unsubscribeSnapshot(); unsubscribeAuth(); };
  }, []);

  useEffect(() => { if (!user) return; setPointsBalance(user.points ?? 0); setBuddyEnergy(user.avatar?.energy ?? 100); setBuddyHunger(user.avatar?.hunger ?? 100); setBuddyLevel(user.avatar?.level ?? user.level ?? 1); setStepsToday(user.stepsToday ?? 0); }, [user]);
  useEffect(() => { const priceRate = getPriceRate(economyConfig.reserve, economyConfig.totalSupply); setFoodPrice(Math.round(economyConfig.baseFoodPrice * priceRate)); }, []);

  const handleLogout = async () => { try { setMessage("Du wirst abgemeldet..."); await signOut(auth); window.location.href = "/"; } catch { setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen."); } };
  const updateUserProgress = async (updatedUser: User, successMessage: string, errorMessage: string) => { setUser(updatedUser); writeCachedUser(updatedUser); try { await setDoc(doc(db, "users", updatedUser.id), { points: updatedUser.points, xp: updatedUser.xp, stepsToday: updatedUser.stepsToday, level: updatedUser.level, avatar: updatedUser.avatar, updatedAt: new Date().toISOString() }, { merge: true }); setMessage(successMessage); } catch { setMessage(errorMessage); } };
  const startChallenge = async () => {
    if (!user) { setMessage("Bitte warte, bis dein WellFit Profil geladen ist."); return; }
    const reward = mission.reward;
    const newSteps = stepsToday + mission.steps;
    const newPoints = pointsBalance + reward;
    const newEnergy = Math.max(buddyEnergy - 6, 0);
    const newHunger = Math.max(buddyHunger - 4, 0);
    const nextBuddyLevel = newPoints >= 150 && buddyLevel === 1 ? 2 : buddyLevel;
    setTrackingActive(true); setBuddyEnergy(newEnergy); setBuddyHunger(newHunger); setStepsToday(newSteps); setPointsBalance(newPoints); setBuddyLevel(nextBuddyLevel);
    await updateUserProgress({ ...user, points: newPoints, xp: (user.xp ?? 0) + reward, stepsToday: newSteps, level: Math.max(user.level ?? 1, nextBuddyLevel), avatar: { ...user.avatar, level: nextBuddyLevel, energy: newEnergy, hunger: newHunger } }, `Mission gestartet: +${mission.steps} Schritte, +${reward} XP`, "Mission lokal aktualisiert, Firebase konnte nicht gespeichert werden.");
  };
  const feedBuddy = async () => { if (!user) return; if (pointsBalance < foodPrice) { setMessage("Nicht genug Punkte für Futter."); return; } const newPoints = pointsBalance - foodPrice; const newHunger = Math.min(buddyHunger + 15, 100); setPointsBalance(newPoints); setBuddyHunger(newHunger); await updateUserProgress({ ...user, points: newPoints, avatar: { ...user.avatar, hunger: newHunger } }, `Flammi wurde gefüttert. -${foodPrice} Punkte`, "Flammi wurde lokal aktualisiert, aber Firebase konnte nicht gespeichert werden."); };
  const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full"><aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6"><div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="h-auto w-[150px] object-contain" priority /></div><nav className="space-y-2 text-[14px]"><div className="font-bold text-orange-400">Dashboard</div><Link href="/missionen/tagesmissionen" className="block text-white/80">Missionen</Link><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav><div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div><div className="mt-auto pt-4"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block font-bold text-cyan-300">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-4 border-t border-cyan-400/10 pt-3"><button onClick={handleLogout} className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div></aside>
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0"><header className="mb-4 flex items-start justify-between"><div><h1 className="text-5xl font-extrabold leading-none">Dashboard</h1><p className="mt-1 text-lg text-cyan-100/90">{message}</p><p className={`mt-1 text-xs font-semibold ${isRealtimeConnected ? "text-green-300" : "text-yellow-200"}`}>Realtime: {isRealtimeConnected ? "verbunden" : loadedFromCache ? "Cache aktiv" : "wird verbunden"}</p></div><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">Flammi LVL {(isLoadingUser && !user) ? "..." : buddyLevel}</div></header>
          <div className="mb-4 overflow-hidden rounded-[30px] border border-cyan-200/20 bg-white/10 p-5 shadow-[0_14px_45px_rgba(0,0,0,0.18)] backdrop-blur-sm"><div className="grid grid-cols-[1fr_260px] gap-5"><div><div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100/70">Mission Start</div><h2 className="mt-1 text-3xl font-black text-white">{mission.title}</h2><p className="mt-2 text-white/75">Flammi hat deine Daten gelesen: Ziel <b>{mission.goal}</b>, Aktivität <b>{mission.activity}</b>, Fokus <b>{mission.focus}</b>.</p><p className="mt-2 text-sm text-cyan-100/80">{mission.note}</p><div className="mt-4 grid grid-cols-3 gap-3 text-sm"><div className="rounded-2xl bg-black/20 px-4 py-3"><div className="text-white/50">Ziel heute</div><div className="text-xl font-black text-cyan-100">{mission.steps}</div><div>Schritte</div></div><div className="rounded-2xl bg-black/20 px-4 py-3"><div className="text-white/50">Belohnung</div><div className="text-xl font-black text-cyan-100">+{mission.reward}</div><div>XP/Punkte</div></div><div className="rounded-2xl bg-black/20 px-4 py-3"><div className="text-white/50">Buddy</div><div className="text-xl font-black text-cyan-100">Flammi</div><div>aktiv</div></div></div></div><div className="flex flex-col items-center justify-center rounded-[26px] bg-black/20 p-4 text-center"><div className="text-7xl">🐉</div><p className="mt-2 text-sm text-white/70">„Ich passe deine erste Mission an dich an.“</p><button onClick={startChallenge} disabled={!user} className="mt-4 w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-500">Mission starten</button></div></div></div>
          <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto pb-20 pr-2"><div className={cardClass}><h2 className="text-2xl font-bold text-cyan-300">Deine Gesundheit</h2><p className="mt-3 text-lg font-bold text-white">{stepsToday} / 10.000 Schritte</p><div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${Math.min((stepsToday / 10000) * 100, 100)}%` }} /></div></div><div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Mission</h2><p className="text-base text-white/80">{mission.title}</p><p className="mt-2 text-sm text-white/60">{mission.activity} für {mission.goal}</p></div><div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Punkte</h2><p className="text-4xl font-extrabold leading-tight">{pointsBalance} Punkte</p></div><div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Mein Begleiter</h2><div className="text-4xl">🐉</div><p className="mt-3 text-lg">Energie: {buddyEnergy}%</p><p className="mt-1 text-lg">Hunger: {buddyHunger}%</p><button type="button" onClick={feedBuddy} className="mt-3 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-bold hover:bg-cyan-700">Flammi füttern</button></div><div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Economy</h2><p className="text-lg text-white/90">Reserve: {economyConfig.reserve}</p><p className="text-lg text-white/90">Umlauf: {economyConfig.circulating}</p></div><div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Belohnungen</h2><p className="text-lg text-yellow-400">Mission: +{mission.reward} Punkte</p><p className="text-lg">Aktivserie: 1 Tage 🔥</p></div></div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Status</p><p className="mt-1 text-sm font-semibold text-white">Mission bereit</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">WellFit Punkte</p><p className="mt-1 text-lg font-bold text-white">{pointsBalance.toFixed(2)}</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div></section></div>
    </main>
  );
}
