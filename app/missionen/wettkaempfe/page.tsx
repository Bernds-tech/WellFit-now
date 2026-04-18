"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";

type ArenaTab = "Nutzerduelle" | "Avatar-Arena" | "Live & Wetten";

type UserDuel = {
  id: number;
  title: string;
  type: string;
  description: string;
  entryFee: number;
  reward: number;
  playersOnline: number;
  duration: string;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  icon: string;
};

type AvatarBattle = {
  id: number;
  title: string;
  arena: string;
  description: string;
  entryFee: number;
  reward: number;
  fighterA: string;
  fighterB: string;
  status: string;
  icon: string;
};

type LiveBet = {
  id: number;
  title: string;
  duelType: string;
  pot: number;
  oddsA: string;
  oddsB: string;
  fighterA: string;
  fighterB: string;
  viewers: number;
  icon: string;
};

const userDuels: UserDuel[] = [
  {
    id: 1,
    title: "Mathe-Speed Duel",
    type: "1 vs 1",
    description:
      "Löse mehr Aufgaben als dein Gegner in 45 Sekunden und sichere dir den WFT-Pot.",
    entryFee: 10,
    reward: 40,
    playersOnline: 18,
    duration: "45 Sek.",
    difficulty: "Mittel",
    icon: "🧠",
  },
  {
    id: 2,
    title: "Liegestütz Clash",
    type: "1 vs 1",
    description:
      "Wer schafft mehr saubere Wiederholungen? Perfekt für direkte Fitness-Duelle.",
    entryFee: 12,
    reward: 55,
    playersOnline: 24,
    duration: "30 Sek.",
    difficulty: "Schwer",
    icon: "💪",
  },
  {
    id: 3,
    title: "Reflex Arena",
    type: "Solo / PvP",
    description:
      "Tippe schneller als dein Gegner auf die richtigen Ziele und gewinne Bonus-WFT.",
    entryFee: 6,
    reward: 25,
    playersOnline: 11,
    duration: "25 Sek.",
    difficulty: "Leicht",
    icon: "🎯",
  },
];

const avatarBattles: AvatarBattle[] = [
  {
    id: 1,
    title: "Schwertkampf der Ritter",
    arena: "Burg-Arena",
    description:
      "Zwei Avatare treten mit ihren Waffen, Leveln und Fähigkeiten gegeneinander an.",
    entryFee: 20,
    reward: 110,
    fighterA: "Flammi",
    fighterB: "Drako",
    status: "Bereit",
    icon: "⚔️",
  },
  {
    id: 2,
    title: "Drachenjagd Duell",
    arena: "Feuergrube",
    description:
      "Avatare kämpfen um Beute, Ehre und einen Anteil am Arena-Pot.",
    entryFee: 18,
    reward: 95,
    fighterA: "Auron",
    fighterB: "Mystra",
    status: "Live",
    icon: "🐉",
  },
  {
    id: 3,
    title: "Zauberduell",
    arena: "Kristallhalle",
    description:
      "Magische Spezialangriffe, Verteidigung und Timing entscheiden über Sieg oder Niederlage.",
    entryFee: 15,
    reward: 80,
    fighterA: "Lunara",
    fighterB: "Nox",
    status: "Bereit",
    icon: "✨",
  },
];

const liveBets: LiveBet[] = [
  {
    id: 1,
    title: "Live: Flammi vs Drako",
    duelType: "Avatar-Arena",
    pot: 320,
    oddsA: "1.8",
    oddsB: "2.1",
    fighterA: "Flammi",
    fighterB: "Drako",
    viewers: 44,
    icon: "👁️",
  },
  {
    id: 2,
    title: "Live: Mathe-Speed Finale",
    duelType: "Nutzerduell",
    pot: 210,
    oddsA: "1.5",
    oddsB: "2.6",
    fighterA: "Kevin",
    fighterB: "Mira",
    viewers: 31,
    icon: "📡",
  },
  {
    id: 3,
    title: "Live: Push-Up Titanen",
    duelType: "Nutzerduell",
    pot: 410,
    oddsA: "2.0",
    oddsB: "1.9",
    fighterA: "Rico",
    fighterB: "Sven",
    viewers: 52,
    icon: "🔥",
  },
];

export default function WettkaempfePage() {
  const [brightness, setBrightness] = useState(100);
  const [activeArenaTab, setActiveArenaTab] =
    useState<ArenaTab>("Nutzerduelle");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [jackpot, setJackpot] = useState(2480);
  const [message, setMessage] = useState("Bereit für den nächsten Wettkampf?");
  const [user, setUser] = useState<User | null>(null);
  const [buddyLevel] = useState(1);

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedJackpot = localStorage.getItem("wellfit-jackpot");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Fehler beim Laden des Users", error);
      }
    }

    if (savedJackpot) {
      try {
        setJackpot(JSON.parse(savedJackpot));
      } catch (error) {
        console.error("Fehler beim Laden des Jackpots", error);
      }
    }
  }, []);

  useEffect(() => {
    setSelectedId(1);
  }, [activeArenaTab]);

  const activeList = useMemo(() => {
    if (activeArenaTab === "Nutzerduelle") return userDuels;
    if (activeArenaTab === "Avatar-Arena") return avatarBattles;
    return liveBets;
  }, [activeArenaTab]);

  const selectedItem = useMemo(() => {
    return activeList.find((item) => item.id === selectedId) ?? activeList[0];
  }, [activeList, selectedId]);

  const startUserDuel = () => {
    if (!user) {
      setMessage("Bitte zuerst registrieren oder einloggen.");
      return;
    }

    if (activeArenaTab !== "Nutzerduelle") return;

    const duel = selectedItem as UserDuel;
    const currentPoints = user.points ?? 0;

    if (currentPoints < duel.entryFee) {
      setMessage(`Nicht genug WFT. Einsatz: ${duel.entryFee} WFT.`);
      return;
    }

    const updatedUser: User = {
      ...user,
      points: currentPoints - duel.entryFee,
    };

    const newJackpot = jackpot + duel.entryFee * 2;

    setUser(updatedUser);
    setJackpot(newJackpot);
    setMessage(`Nutzerduell gestartet: ${duel.title}`);

    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem("wellfit-jackpot", JSON.stringify(newJackpot));
  };

  const startAvatarBattle = () => {
    if (!user) {
      setMessage("Bitte zuerst registrieren oder einloggen.");
      return;
    }

    if (activeArenaTab !== "Avatar-Arena") return;

    const battle = selectedItem as AvatarBattle;
    const currentPoints = user.points ?? 0;

    if (currentPoints < battle.entryFee) {
      setMessage(`Nicht genug WFT. Einsatz: ${battle.entryFee} WFT.`);
      return;
    }

    const updatedUser: User = {
      ...user,
      points: currentPoints - battle.entryFee,
    };

    const newJackpot = jackpot + battle.entryFee * 2;

    setUser(updatedUser);
    setJackpot(newJackpot);
    setMessage(`Avatar-Kampf gestartet: ${battle.title}`);

    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem("wellfit-jackpot", JSON.stringify(newJackpot));
  };

  const placeBet = (fighter: "A" | "B") => {
    if (!user) {
      setMessage("Bitte zuerst registrieren oder einloggen.");
      return;
    }

    if (activeArenaTab !== "Live & Wetten") return;

    const bet = selectedItem as LiveBet;
    const stake = 8;
    const currentPoints = user.points ?? 0;

    if (currentPoints < stake) {
      setMessage(`Nicht genug WFT für eine Wette. Einsatz: ${stake} WFT.`);
      return;
    }

    const updatedUser: User = {
      ...user,
      points: currentPoints - stake,
    };

    const newJackpot = jackpot + stake;

    setUser(updatedUser);
    setJackpot(newJackpot);
    setMessage(
      `Wette platziert auf ${
        fighter === "A" ? bet.fighterA : bet.fighterB
      } (${stake} WFT)`
    );

    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem("wellfit-jackpot", JSON.stringify(newJackpot));
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${
          brightness / 100
        }), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center">
            <Image
              src="/Logo.png"
              alt="WellFit Logo"
              width={150}
              height={150}
              className="h-auto w-[150px] object-contain"
              priority
            />
          </div>

          <nav className="space-y-2 text-[14px]">
            <Link href="/dashboard" className="block text-white/80">
              Dashboard
            </Link>
            <div className="font-bold text-orange-400">Missionen</div>
            <div className="text-white/80">Mein KI-Buddy</div>
            <div className="text-white/80">Marktplatz</div>
            <div className="text-white/80">Leaderboard</div>
            <div className="text-white/80">Wallet</div>
            <div className="text-white/80">Analytics & Stats</div>
          </nav>

          <div className="mt-10 border-t border-cyan-400/10 pt-8">
            <div className="mb-3 text-xl font-bold text-green-400">
              App aufs Handy laden
            </div>

            <label className="mb-2 block text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 text-right text-sm text-white/70">
              {brightness}%
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="space-y-2 text-[14px]">
              <Link href="/einstellungen" className="block text-white/80">
                Einstellungen
              </Link>
              <Link href="/datenschutz" className="block text-white/80">
                Datenschutz
              </Link>
              <Link href="/agb" className="block text-white/80">
                AGB
              </Link>
              <Link href="/impressum" className="block text-white/80">
                Impressum
              </Link>
              <Link href="/faq" className="block text-white/80">
                FAQ
              </Link>
              <div className="block text-white/80">Hilfe</div>
            </div>

            <div className="mt-6 border-t border-cyan-400/10 pt-4">
              <button className="text-[14px] font-bold text-red-400 hover:text-red-300">
                Abmelden
              </button>
            </div>
          </div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-10 py-7 pb-0">
          <div className="mb-5 flex items-start justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold">Wettkämpfe</h1>
              <p className="text-cyan-200">{message}</p>
            </div>

            <div className="flex flex-1 justify-center">
              <div className="relative h-[110px] w-[520px] overflow-hidden rounded-[24px]">
                <Image
                  src="/jackpot.png"
                  alt="Jackpot Banner"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="pt-5 text-center">
                    <p className="text-[16px] font-semibold tracking-[0.35em] text-yellow-300/90">
                      JACKPOT
                    </p>
                    <p className="mt-1 text-5xl font-extrabold text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]">
                      {jackpot.toLocaleString("de-DE")} WFT
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-5 py-2 text-white/90">
                Synchron
              </button>
              <button className="rounded-full bg-orange-500 px-5 py-2 font-bold">
                Tracker starten
              </button>
              <div className="rounded-full bg-[#073b44] px-4 py-2">
                Flammi LVL {buddyLevel}
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
  <div className="flex items-center gap-8 rounded-full border border-white/10 bg-[#0b6d79]/35 px-8 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
    <Link
      href="/missionen/tagesmissionen"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Tagesmissionen
    </Link>

    <Link
      href="/missionen/wochenmissionen"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Wochenmissionen
    </Link>

    <Link
      href="/missionen/abenteuer"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Abenteuer
    </Link>

    <Link
      href="/missionen/challenge"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Challenge
    </Link>

    <div className="relative pb-1 text-2xl font-semibold text-orange-400">
      Wettkämpfe
      <span className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-orange-400" />
    </div>

    <Link
      href="/missionen/favoriten"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Favoriten
    </Link>

    <Link
      href="/missionen/history"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      History
    </Link>
  </div>
</div>

          <div className="mb-6 flex gap-3">
            {(["Nutzerduelle", "Avatar-Arena", "Live & Wetten"] as ArenaTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveArenaTab(tab)}
                  className={`rounded-2xl border px-6 py-3 text-lg font-semibold transition ${
                    activeArenaTab === tab
                      ? "border-cyan-300 bg-cyan-300 text-black"
                      : "border-white/15 bg-[#053841]/85 text-white/80 hover:bg-[#07505c]"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.55fr_1fr] gap-6 overflow-hidden pb-28">
            <div className="min-h-0 space-y-6 overflow-y-auto pr-3 pb-6">
              <div className="rounded-[28px] border border-yellow-400/25 bg-[#053841]/90 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-yellow-400/80">
                      Arena Modus
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {activeArenaTab}
                    </h2>
                    <p className="mt-2 text-lg text-white/75">
                      Direkte Duelle, Avatar-Kämpfe und Live-Wetten rund um den
                      WellFit Jackpot.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-yellow-400/30 bg-yellow-500/10 px-6 py-5 text-center">
                    <p className="text-sm uppercase text-yellow-300/80">
                      Jackpot
                    </p>
                    <p className="mt-1 text-4xl font-extrabold text-yellow-400">
                      {jackpot.toLocaleString("de-DE")}
                    </p>
                    <p className="text-lg font-semibold text-yellow-300">
                      WFT
                    </p>
                  </div>
                </div>
              </div>

              {activeArenaTab === "Nutzerduelle" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-cyan-300">
                    Offene Nutzerduelle
                  </h2>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {userDuels.map((duel) => (
                      <div
                        key={duel.id}
                        onClick={() => setSelectedId(duel.id)}
                        className={`cursor-pointer rounded-[28px] border p-5 transition ${
                          selectedId === duel.id
                            ? "border-yellow-400 bg-[#07505c]"
                            : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="text-5xl">{duel.icon}</div>
                          <span className="rounded-xl bg-cyan-400/15 px-3 py-1 text-sm text-cyan-300">
                            {duel.type}
                          </span>
                        </div>

                        <p className="text-2xl font-bold">{duel.title}</p>
                        <p className="mt-2 text-white/70">{duel.description}</p>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/70">
                          <p>👥 Online: {duel.playersOnline}</p>
                          <p>⏱ {duel.duration}</p>
                          <p>🎯 {duel.difficulty}</p>
                          <p>🪙 Einsatz: {duel.entryFee} WFT</p>
                        </div>

                        <p className="mt-4 text-lg font-semibold text-orange-400">
                          Gewinn: {duel.reward} WFT
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeArenaTab === "Avatar-Arena" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-cyan-300">
                    Avatar-Kämpfe
                  </h2>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {avatarBattles.map((battle) => (
                      <div
                        key={battle.id}
                        onClick={() => setSelectedId(battle.id)}
                        className={`cursor-pointer rounded-[28px] border p-5 transition ${
                          selectedId === battle.id
                            ? "border-yellow-400 bg-[#07505c]"
                            : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="text-5xl">{battle.icon}</div>
                          <span className="rounded-xl bg-fuchsia-500/15 px-3 py-1 text-sm text-fuchsia-300">
                            {battle.status}
                          </span>
                        </div>

                        <p className="text-2xl font-bold">{battle.title}</p>
                        <p className="mt-2 text-white/70">{battle.description}</p>

                        <div className="mt-4 text-sm text-white/70">
                          <p>🏟 Arena: {battle.arena}</p>
                          <p className="mt-1">
                            ⚔ {battle.fighterA} vs {battle.fighterB}
                          </p>
                          <p className="mt-1">🪙 Einsatz: {battle.entryFee} WFT</p>
                        </div>

                        <p className="mt-4 text-lg font-semibold text-orange-400">
                          Gewinn: {battle.reward} WFT
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeArenaTab === "Live & Wetten" && (
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-cyan-300">
                    Live-Kämpfe & Wetten
                  </h2>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {liveBets.map((bet) => (
                      <div
                        key={bet.id}
                        onClick={() => setSelectedId(bet.id)}
                        className={`cursor-pointer rounded-[28px] border p-5 transition ${
                          selectedId === bet.id
                            ? "border-yellow-400 bg-[#07505c]"
                            : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <div className="text-5xl">{bet.icon}</div>
                          <span className="rounded-xl bg-red-500/15 px-3 py-1 text-sm text-red-300">
                            LIVE
                          </span>
                        </div>

                        <p className="text-2xl font-bold">{bet.title}</p>
                        <p className="mt-2 text-white/70">{bet.duelType}</p>

                        <div className="mt-4 text-sm text-white/70">
                          <p>
                            🥊 {bet.fighterA} vs {bet.fighterB}
                          </p>
                          <p className="mt-1">👁 Zuschauer: {bet.viewers}</p>
                          <p className="mt-1">🪙 Pot: {bet.pot} WFT</p>
                          <p className="mt-1">
                            📈 Quoten: {bet.oddsA} / {bet.oddsB}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-0 overflow-y-auto rounded-[32px] bg-[#053841]/90 p-7 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              {activeArenaTab === "Nutzerduelle" && selectedItem && (
                <>
                  {(() => {
                    const duel = selectedItem as UserDuel;
                    return (
                      <>
                        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                          Nutzerduell
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-white">
                          {duel.title}
                        </h2>

                        <div className="mt-5 flex justify-center text-7xl">
                          {duel.icon}
                        </div>

                        <div className="mt-5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-3 text-center font-semibold text-fuchsia-300">
                          Direktes PvP · {duel.type}
                        </div>

                        <p className="mt-6 text-lg leading-relaxed text-white/80">
                          {duel.description}
                        </p>

                        <div className="mt-6 space-y-3 text-base text-white/80">
                          <p>👥 Spieler online: {duel.playersOnline}</p>
                          <p>⏱ Dauer: {duel.duration}</p>
                          <p>🎯 Schwierigkeit: {duel.difficulty}</p>
                          <p>🪙 Einsatz: {duel.entryFee} WFT</p>
                        </div>

                        <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
                          <div className="flex items-center justify-between text-xl">
                            <span className="font-semibold text-white/90">
                              Gewinn
                            </span>
                            <span className="font-bold text-yellow-400">
                              {duel.reward} WFT
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={startUserDuel}
                          className="mt-8 w-full rounded-2xl bg-orange-500 px-6 py-4 text-2xl font-bold text-white transition hover:bg-orange-600"
                        >
                          Nutzerduell starten
                        </button>
                      </>
                    );
                  })()}
                </>
              )}

              {activeArenaTab === "Avatar-Arena" && selectedItem && (
                <>
                  {(() => {
                    const battle = selectedItem as AvatarBattle;
                    return (
                      <>
                        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                          Avatar-Arena
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-white">
                          {battle.title}
                        </h2>

                        <div className="mt-5 flex justify-center text-7xl">
                          {battle.icon}
                        </div>

                        <div className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-center font-semibold text-cyan-300">
                          {battle.fighterA} vs {battle.fighterB}
                        </div>

                        <p className="mt-6 text-lg leading-relaxed text-white/80">
                          {battle.description}
                        </p>

                        <div className="mt-6 space-y-3 text-base text-white/80">
                          <p>🏟 Arena: {battle.arena}</p>
                          <p>⚔ Status: {battle.status}</p>
                          <p>🪙 Einsatz: {battle.entryFee} WFT</p>
                        </div>

                        <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
                          <div className="flex items-center justify-between text-xl">
                            <span className="font-semibold text-white/90">
                              Gewinn
                            </span>
                            <span className="font-bold text-yellow-400">
                              {battle.reward} WFT
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={startAvatarBattle}
                          className="mt-8 w-full rounded-2xl bg-orange-500 px-6 py-4 text-2xl font-bold text-white transition hover:bg-orange-600"
                        >
                          Avatar-Kampf starten
                        </button>
                      </>
                    );
                  })()}
                </>
              )}

              {activeArenaTab === "Live & Wetten" && selectedItem && (
                <>
                  {(() => {
                    const bet = selectedItem as LiveBet;
                    return (
                      <>
                        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/80">
                          Live & Wetten
                        </p>
                        <h2 className="mt-2 text-4xl font-bold text-white">
                          {bet.title}
                        </h2>

                        <div className="mt-5 flex justify-center text-7xl">
                          {bet.icon}
                        </div>

                        <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-center font-semibold text-red-300">
                          LIVE · {bet.duelType}
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a3d46] px-5 py-4">
                          <p className="text-2xl font-bold text-white">
                            {bet.fighterA} vs {bet.fighterB}
                          </p>
                          <p className="mt-2 text-white/70">
                            Zuschauer: {bet.viewers}
                          </p>
                        </div>

                        <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
                          <div className="flex items-center justify-between text-xl">
                            <span className="font-semibold text-white/90">
                              Aktueller Pot
                            </span>
                            <span className="font-bold text-yellow-400">
                              {bet.pot} WFT
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <button
                            onClick={() => placeBet("A")}
                            className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-5 text-left transition hover:bg-cyan-400/20"
                          >
                            <p className="text-sm uppercase text-white/50">
                              Wette auf
                            </p>
                            <p className="mt-1 text-2xl font-bold text-white">
                              {bet.fighterA}
                            </p>
                            <p className="mt-2 text-cyan-300">
                              Quote {bet.oddsA}
                            </p>
                          </button>

                          <button
                            onClick={() => placeBet("B")}
                            className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-400/10 px-4 py-5 text-left transition hover:bg-fuchsia-400/20"
                          >
                            <p className="text-sm uppercase text-white/50">
                              Wette auf
                            </p>
                            <p className="mt-1 text-2xl font-bold text-white">
                              {bet.fighterB}
                            </p>
                            <p className="mt-2 text-fuchsia-300">
                              Quote {bet.oddsB}
                            </p>
                          </button>
                        </div>

                        <p className="mt-6 text-sm text-white/60">
                          Standard-Wetteinsatz: 8 WFT
                        </p>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="min-w-[190px] rounded-2xl border border-cyan-400/10 bg-[#041f24] px-4 py-3">
                <p className="text-xs uppercase text-white/50">
                  Letzter Login: Heute 9:43
                </p>
                <p className="mt-1 text-xl font-semibold text-white">
                  3 WFT erhalten
                </p>
              </div>

              <div className="min-w-[190px] rounded-2xl border border-yellow-500/60 bg-[#041f24] px-4 py-3 text-center">
                <p className="text-xs uppercase text-white/50">WFT-Punkte</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {user?.points ?? 0}
                </p>
              </div>

              <div className="min-w-[190px] rounded-2xl border border-cyan-400/10 bg-[#041f24] px-4 py-3 text-center">
                <p className="text-xs uppercase text-white/50">
                  Gehortet: 0.00 WFT
                </p>
                <button className="mt-2 w-full rounded-lg bg-blue-700/80 px-4 py-2 font-semibold text-white/70">
                  Abholen
                </button>
              </div>

              <div className="min-w-[220px] rounded-2xl border border-yellow-500/40 bg-[#0a3d46] px-4 py-3 text-center">
                <p className="text-lg font-semibold text-yellow-400">
                  ⚠ Server-Event starten
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-3xl text-white/80">
              <span>f</span>
              <span>𝕏</span>
              <span>in</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}