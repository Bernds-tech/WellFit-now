"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import type { User } from "@/types/user";
import { economyConfig, getPriceRate, getRewardRate } from "@/config/economy";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

const getDashboardCacheKey = (uid: string) => `wellfit-dashboard-user-${uid}`;
const createDefaultUser = (firebaseUser: { uid: string; email: string | null; displayName: string | null; }): User => ({ id: firebaseUser.uid, firstName: firebaseUser.displayName?.split(" ")[0] ?? "", lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "", email: firebaseUser.email ?? "", points: 0, xp: 0, energy: 100, level: 1, stepsToday: 0, currency: "points", avatar: { hunger: 100, mood: 100, energy: 100, level: 1 }, inventory: [] });
const normalizeUser = (rawUser: Partial<User>, userId: string): User => ({ id: userId, firstName: rawUser.firstName ?? "", lastName: rawUser.lastName ?? "", email: rawUser.email ?? "", points: rawUser.points ?? 0, xp: rawUser.xp ?? 0, energy: rawUser.energy ?? 100, level: rawUser.level ?? 1, stepsToday: rawUser.stepsToday ?? 0, currency: rawUser.currency ?? "points", avatar: { hunger: rawUser.avatar?.hunger ?? 100, mood: rawUser.avatar?.mood ?? 100, energy: rawUser.avatar?.energy ?? 100, level: rawUser.avatar?.level ?? rawUser.level ?? 1 }, inventory: rawUser.inventory ?? [] });
const readCachedUser = (uid: string): User | null => { try { const cached = localStorage.getItem(getDashboardCacheKey(uid)); return cached ? normalizeUser(JSON.parse(cached) as Partial<User>, uid) : null; } catch (error) { console.error("Dashboard Cache konnte nicht gelesen werden", error); return null; } };
const writeCachedUser = (user: User) => { try { localStorage.setItem(getDashboardCacheKey(user.id), JSON.stringify(user)); } catch (error) { console.error("Dashboard Cache konnte nicht gespeichert werden", error); } };

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

  useEffect(() => {
    const savedPermissions = localStorage.getItem("wellfit-permissions");
    if (savedPermissions) { try { const parsed = JSON.parse(savedPermissions); setPermissions({ location: !!parsed.location }); } catch (error) { console.error("Fehler beim Lesen der Permissions", error); } }
    let unsubscribeSnapshot: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = undefined; }
      setIsLoadingUser(true); setLoadedFromCache(false); setIsRealtimeConnected(false);
      if (!firebaseUser) { setUser(null); setMessage("Nicht eingeloggt."); setIsLoadingUser(false); return; }
      const cachedUser = readCachedUser(firebaseUser.uid);
      if (cachedUser) { setUser(cachedUser); setLoadedFromCache(true); setMessage("Dashboard wird live synchronisiert..."); }
      const userRef = doc(db, "users", firebaseUser.uid);
      const now = new Date().toISOString();
      try { await setDoc(userRef, { lastLoginAt: now, updatedAt: now }, { merge: true }); } catch (error) { console.error("lastLoginAt konnte nicht aktualisiert werden:", error); }
      unsubscribeSnapshot = onSnapshot(userRef, async (userSnap) => {
        if (userSnap.exists()) { const normalizedUser = normalizeUser(userSnap.data() as Partial<User>, firebaseUser.uid); setUser(normalizedUser); writeCachedUser(normalizedUser); setLoadedFromCache(false); setIsRealtimeConnected(true); setMessage("Dashboard live synchronisiert."); setIsLoadingUser(false); return; }
        const defaultUser = createDefaultUser(firebaseUser);
        await setDoc(userRef, { ...defaultUser, createdAt: now, lastLoginAt: now, updatedAt: now, onboardingCompleted: false }, { merge: true });
        setUser(defaultUser); writeCachedUser(defaultUser); setIsRealtimeConnected(true); setMessage("Willkommen! Dein WellFit-Profil wurde angelegt."); setIsLoadingUser(false);
      }, (error) => { console.error("Realtime Dashboard Sync fehlgeschlagen:", error); setIsRealtimeConnected(false); setMessage(cachedUser ? "Offline/Cache aktiv – Realtime Sync nicht verfügbar." : "User konnte nicht live geladen werden."); setIsLoadingUser(false); });
    });
    return () => { if (unsubscribeSnapshot) unsubscribeSnapshot(); unsubscribeAuth(); };
  }, []);

  useEffect(() => { const handleFocus = () => { const savedPermissions = localStorage.getItem("wellfit-permissions"); if (savedPermissions) { try { const parsed = JSON.parse(savedPermissions); setPermissions({ location: !!parsed.location }); } catch (error) { console.error("Fehler beim Aktualisieren der Permissions", error); } } }; window.addEventListener("focus", handleFocus); return () => window.removeEventListener("focus", handleFocus); }, []);
  useEffect(() => { if (!user) return; setPointsBalance(user.points ?? 0); setBuddyEnergy(user.avatar?.energy ?? 100); setBuddyHunger(user.avatar?.hunger ?? 100); setBuddyLevel(user.avatar?.level ?? user.level ?? 1); setStepsToday(user.stepsToday ?? 0); }, [user]);
  useEffect(() => { const priceRate = getPriceRate(economyConfig.reserve, economyConfig.totalSupply); setFoodPrice(Math.round(economyConfig.baseFoodPrice * priceRate)); }, []);

  const handleLogout = async () => { try { setMessage("Du wirst abgemeldet..."); await signOut(auth); window.location.href = "/"; } catch (error) { console.error("Logout fehlgeschlagen", error); setMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen."); } };
  const updateUserProgress = async (updatedUser: User, successMessage: string, errorMessage: string) => { setUser(updatedUser); writeCachedUser(updatedUser); try { await setDoc(doc(db, "users", updatedUser.id), { points: updatedUser.points, stepsToday: updatedUser.stepsToday, level: updatedUser.level, avatar: updatedUser.avatar, updatedAt: new Date().toISOString() }, { merge: true }); setMessage(successMessage); } catch (error) { console.error(errorMessage, error); setMessage(errorMessage); } };

  const startChallenge = async () => {
    if (isLoadingUser && !user) { setMessage("Bitte warte, bis dein WellFit Profil geladen ist."); return; }
    if (!permissions.location) { setMessage("Bitte aktiviere Standort in den Einstellungen."); return; }
    if (!navigator.geolocation) { setMessage("GPS wird von deinem Gerät nicht unterstützt."); return; }
    if (trackingActive) { setTrackingActive(false); setMessage("Tracking gestoppt."); return; }
    setMessage("Hole Standort...");
    navigator.geolocation.getCurrentPosition(async (position) => {
      console.log("GPS:", position.coords); setTrackingActive(true);
      const newSteps = stepsToday + 500; const rewardRate = getRewardRate(economyConfig.reserve, economyConfig.totalSupply); const reward = Math.round(economyConfig.baseReward * rewardRate); const newPoints = pointsBalance + reward;
      economyConfig.reserve -= reward; economyConfig.circulating += reward;
      const newEnergy = Math.max(buddyEnergy - 5, 0); const newHunger = Math.max(buddyHunger - 3, 0); const nextBuddyLevel = newPoints >= 150 && buddyLevel === 1 ? 2 : buddyLevel;
      setBuddyEnergy(newEnergy); setBuddyHunger(newHunger); setStepsToday(newSteps); setPointsBalance(newPoints); setBuddyLevel(nextBuddyLevel);
      if (user) await updateUserProgress({ ...user, points: newPoints, stepsToday: newSteps, level: Math.max(user.level ?? 1, nextBuddyLevel), avatar: { ...user.avatar, level: nextBuddyLevel, energy: newEnergy, hunger: newHunger } }, nextBuddyLevel > buddyLevel ? "Flammi ist auf Level 2 gestiegen." : `GPS aktiv: +500 Schritte, +${reward} Punkte`, "Tracking wurde lokal aktualisiert, aber Firebase konnte nicht gespeichert werden.");
    }, (error) => { console.error(error); setMessage("Standort konnte nicht abgerufen werden."); });
  };

  const feedBuddy = async () => {
    if (isLoadingUser && !user) { setMessage("Bitte warte, bis dein WellFit Profil geladen ist."); return; }
    if (!user) { setMessage("Bitte melde dich an, um Flammi zu füttern."); return; }
    if (pointsBalance < foodPrice) { setMessage("Nicht genug Punkte für Futter."); return; }
    const newPoints = pointsBalance - foodPrice; const fee = Math.round(foodPrice * economyConfig.transactionFee); const toReserve = foodPrice - fee; const newHunger = Math.min(buddyHunger + 15, 100);
    economyConfig.reserve += toReserve; economyConfig.circulating -= foodPrice; setPointsBalance(newPoints); setBuddyHunger(newHunger);
    await updateUserProgress({ ...user, points: newPoints, avatar: { ...user.avatar, hunger: newHunger } }, `Flammi wurde gefüttert. -${foodPrice} Punkte`, "Flammi wurde lokal aktualisiert, aber Firebase konnte nicht gespeichert werden.");
  };

  const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="h-auto w-[150px] object-contain" priority /></div>
          <nav className="space-y-2 text-[14px]"><div className="font-bold text-orange-400">Dashboard</div><Link href="/missionen/tagesmissionen" className="block text-white/80">Missionen</Link><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-10 border-t border-cyan-400/10 pt-8"><div className="mb-3 text-xl font-bold text-green-400">App aufs Handy laden</div><label className="mb-2 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="w-full" /><div className="mt-2 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto pt-8"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block font-bold text-cyan-300">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-6 border-t border-cyan-400/10 pt-4"><button onClick={handleLogout} className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div>
        </aside>
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <header className="mb-4 flex items-start justify-between"><div><h1 className="text-5xl font-extrabold leading-none">Dashboard</h1><p className="mt-1 text-lg text-cyan-100/90">{message}</p>{isLoadingUser && (<div className="mt-2 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">{loadedFromCache ? "Synchronisiere live mit Firebase..." : "WellFit Profil wird geladen..."}</div>)}<div className="mt-2"><span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${trackingActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{trackingActive ? "● Tracking aktiv" : "● Tracking inaktiv"}</span></div><p className={`mt-1 text-sm font-semibold ${permissions.location ? "text-green-400" : "text-red-400"}`}>Standort: {permissions.location ? "erlaubt" : "nicht erlaubt"}</p><p className={`mt-1 text-xs font-semibold ${isRealtimeConnected ? "text-green-300" : "text-yellow-200"}`}>Realtime: {isRealtimeConnected ? "verbunden" : loadedFromCache ? "Cache aktiv" : "wird verbunden"}</p>{!permissions.location && (<div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm"><p className="font-semibold text-red-300">Standort ist deaktiviert – Tracking nicht möglich</p><Link href="/einstellungen" className="mt-1 inline-block text-xs text-cyan-300 underline">Jetzt aktivieren</Link></div>)}</div><div className="flex items-center gap-2 pt-1"><button onClick={startChallenge} disabled={!permissions.location || (isLoadingUser && !user)} className={`rounded-[16px] px-5 py-3 text-sm font-bold text-white transition ${permissions.location && !(isLoadingUser && !user) ? "bg-orange-500 hover:bg-orange-600" : "cursor-not-allowed bg-gray-500"}`}>{trackingActive ? "Tracking stoppen" : "Tracking starten"}</button><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">Flammi LVL {(isLoadingUser && !user) ? "..." : buddyLevel}</div></div></header>
          <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto pb-20 pr-2">
            <div className={cardClass}><div className="flex items-start justify-between"><div><h2 className="text-2xl font-bold text-cyan-300">Deine Gesundheit</h2><p className="mt-1 text-sm text-white/70">Tagesfortschritt</p></div><div className="flex h-20 w-20 items-center justify-center rounded-full border-6 border-cyan-300/30 text-xl font-extrabold text-white">{(isLoadingUser && !user) ? "..." : `${Math.min(Math.round((stepsToday / 10000) * 100), 100)}%`}</div></div><div className="mt-5"><p className="text-lg font-bold text-white">{(isLoadingUser && !user) ? "Lade Schritte..." : `${stepsToday} / 10.000 Schritte`}</p><div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: (isLoadingUser && !user) ? "0%" : `${Math.min((stepsToday / 10000) * 100, 100)}%` }} /></div><p className="mt-3 text-sm text-white/75">Bleib dran – jeder Schritt bringt dich weiter.</p></div></div>
            <div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Missionen</h2><p className="text-base text-white/80">Keine Favoriten markiert. Gehe zu den Missionen!</p></div>
            <div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Punkte</h2><p className="text-4xl font-extrabold leading-tight">{(isLoadingUser && !user) ? "..." : `${pointsBalance} Punkte`}</p><p className="mt-3 text-base text-white/70">Dein Fortschritt</p></div>
            <div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Mein Begleiter</h2><div className="text-4xl">🐉</div><p className="mt-3 text-lg">Energie: {(isLoadingUser && !user) ? "..." : `${buddyEnergy}%`}</p><p className="mt-1 text-lg">Hunger: {(isLoadingUser && !user) ? "..." : `${buddyHunger}%`}</p><p className="mt-1 text-sm text-white/70">Futter kostet: {foodPrice} Punkte</p><button type="button" onClick={feedBuddy} disabled={isLoadingUser && !user} className={`mt-3 rounded-lg px-3 py-2 text-sm font-bold ${(isLoadingUser && !user) ? "cursor-not-allowed bg-gray-500" : "bg-cyan-600 hover:bg-cyan-700"}`}>Flammi füttern</button></div>
            <div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Economy</h2><p className="text-lg text-white/90">Reserve: {economyConfig.reserve}</p><p className="text-lg text-white/90">Umlauf: {economyConfig.circulating}</p></div>
            <div className={cardClass}><h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Belohnungen</h2><p className="text-lg text-yellow-400">Heute: +{Math.round(economyConfig.baseReward * getRewardRate(economyConfig.reserve, economyConfig.totalSupply))} Punkte</p><p className="text-lg">Aktivserie: 1 Tage 🔥</p></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Status: {isRealtimeConnected ? "Realtime + Firebase" : loadedFromCache ? "Cache + Firebase" : "Firebase"}</p><p className="mt-1 text-sm font-semibold text-white">Punkte erhalten</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">WellFit Punkte</p><p className="mt-1 text-lg font-bold text-white">{(isLoadingUser && !user) ? "..." : pointsBalance.toFixed(2)}</p></div><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Bonus verfügbar: 0 Punkte</p><button className="mt-1 w-full rounded-md bg-blue-700/80 px-3 py-1 text-xs font-semibold text-white/70">Abholen</button></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
