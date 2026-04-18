"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@/types/user";

type WeeklyMission = {
  id: number;
  title: string;
  reward: number;
  rewardLabel: string;
  progress: number;
  description: string;
  icon: string;
};

const weeklyMissions: WeeklyMission[] = [
  {
    id: 1,
    title: "Wöchentliche Bewegungsmission",
    reward: 25,
    rewardLabel: "+25 WFT",
    progress: 32,
    description: "Sammle 50.000 Schritte",
    icon: "👟",
  },
  {
    id: 2,
    title: "Wöchentliche Fitnessmission",
    reward: 0,
    rewardLabel: "+1 Wochen-NFT",
    progress: 0,
    description: "3× Ganzkörper-Training pro Woche",
    icon: "🏃",
  },
  {
    id: 3,
    title: "Wöchentliche Wissensmission",
    reward: 25,
    rewardLabel: "+25 WFT",
    progress: 60,
    description: "Schließe 5 Lernmodule ab",
    icon: "🧠",
  },
];

export default function WochenmissionenPage() {
  const [brightness, setBrightness] = useState(100);
  const [selectedMissionId, setSelectedMissionId] = useState<number>(1);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([1]);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Quests?");

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-weekly-missions");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Fehler beim Laden des Users", error);
      }
    }

    if (savedFavorites) {
      try {
        setFavoriteIds(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Fehler beim Laden der Wochen-Favoriten", error);
      }
    }
  }, []);

  const selectedMission =
    weeklyMissions.find((mission) => mission.id === selectedMissionId) ??
    weeklyMissions[0];

  const toggleFavorite = (missionId: number) => {
    const updated = favoriteIds.includes(missionId)
      ? favoriteIds.filter((id) => id !== missionId)
      : [...favoriteIds, missionId];

    setFavoriteIds(updated);
    localStorage.setItem(
      "wellfit-favorite-weekly-missions",
      JSON.stringify(updated)
    );
  };

  const continueMission = () => {
  if (!user) {
    setMessage("Bitte zuerst registrieren oder einloggen.");
    return;
  }

  const alreadyRewardedKey = `wellfit-weekly-mission-${selectedMission.id}-started`;
  const alreadyStarted = localStorage.getItem(alreadyRewardedKey);

  if (alreadyStarted) {
    setMessage(`Mission läuft bereits: ${selectedMission.title}`);
    return;
  }

  const newPoints = (user.points ?? 0) + selectedMission.reward;

  const updatedUser: User = {
    ...user,
    points: newPoints,
  };

  const savedHistory = localStorage.getItem("wellfit-history");
  let historyEntries = [];

  if (savedHistory) {
    try {
      historyEntries = JSON.parse(savedHistory);
    } catch (error) {
      console.error("Fehler beim Laden der History", error);
    }
  }

  historyEntries.unshift({
    id: `weekly-${selectedMission.id}-${Date.now()}`,
    title: selectedMission.title,
    category: "Wochenmissionen",
    rewardLabel: selectedMission.rewardLabel,
    completedAt: new Date().toISOString(),
    icon: selectedMission.icon,
  });

  localStorage.setItem("wellfit-history", JSON.stringify(historyEntries));

  setUser(updatedUser);
  setMessage(
    `Wochenmission gestartet: ${selectedMission.title} (${selectedMission.rewardLabel})`
  );

  localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
  localStorage.setItem(alreadyRewardedKey, "true");
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
              className="object-contain"
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
          <div className="mb-6 flex justify-between">
            <div>
              <h1 className="text-5xl font-bold">Wochenmissionen</h1>
              <p className="text-cyan-200">{message}</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-full bg-orange-500 px-5 py-2 font-bold">
                Tracker starten
              </button>
              <div className="rounded-full bg-[#073b44] px-4 py-2">
                Flammi LVL 1
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

    <div className="relative pb-1 text-2xl font-semibold text-orange-400">
      Wochenmissionen
      <span className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-orange-400" />
    </div>

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

    <Link
      href="/missionen/wettkaempfe"
      className="pb-1 text-2xl text-white/85 hover:text-white"
    >
      Wettkämpfe
    </Link>

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

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-6 overflow-hidden pb-28">
            <div className="min-h-0 space-y-6 overflow-y-auto pr-3 pb-6">
              <div className="rounded-[24px] border border-cyan-300/20 bg-[#053841]/90 px-6 py-4 shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-white">
                      Schließe diese Woche alle 4 Hauptmissionen ab
                    </p>
                    <p className="mt-1 text-lg text-yellow-400">
                      → 50 WFT & Wochenkiste
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-400/30 bg-[#0a3d46] text-3xl">
                    🎁
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {weeklyMissions.map((mission) => (
                  <div
                    key={mission.id}
                    onClick={() => setSelectedMissionId(mission.id)}
                    className={`cursor-pointer rounded-[28px] border p-5 transition ${
                      selectedMissionId === mission.id
                        ? "border-yellow-400 bg-[#07505c]"
                        : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="text-5xl">{mission.icon}</div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(mission.id);
                        }}
                        className={`text-2xl ${
                          favoriteIds.includes(mission.id)
                            ? "text-yellow-400"
                            : "text-white/30"
                        }`}
                      >
                        ★
                      </button>
                    </div>

                    <h3 className="text-2xl font-bold leading-tight text-white">
                      {mission.title}
                    </h3>

                    <p className="mt-3 text-lg text-white/80">
                      {mission.description}
                    </p>

                    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-black/25">
                      <div
                        className="h-full rounded-full bg-cyan-300"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-base text-white/80">
                      <span>{mission.progress}%</span>
                      <span>{mission.rewardLabel}</span>
                    </div>

                    <button className="mt-5 w-full rounded-xl border border-yellow-400/40 bg-[#0a3d46] px-4 py-3 text-xl font-bold text-white transition hover:bg-[#0e4c57]">
                      Fortsetzen
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto rounded-[32px] bg-[#053841]/90 p-7 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <div className="mb-6 flex items-start justify-between gap-3">
                <h2 className="text-4xl font-bold text-white">Missionsdetails</h2>

                <button
                  onClick={() => toggleFavorite(selectedMission.id)}
                  className={`text-4xl ${
                    favoriteIds.includes(selectedMission.id)
                      ? "text-yellow-400"
                      : "text-white/30"
                  }`}
                >
                  ★
                </button>
              </div>

              <div className="mb-4 flex justify-center text-7xl">
                {selectedMission.icon}
              </div>

              <h3 className="text-center text-4xl font-bold text-white">
                {selectedMission.title}
              </h3>

              <p className="mt-3 text-center text-2xl text-white/85">
                {selectedMission.description}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-white/80">
                  <span>Fortschritt</span>
                  <span>{selectedMission.progress}%</span>
                </div>

                <div className="h-4 w-full overflow-hidden rounded-full bg-black/25">
                  <div
                    className="h-full rounded-full bg-cyan-300"
                    style={{ width: `${selectedMission.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
                  <div className="flex items-center justify-between text-xl">
                    <span className="font-semibold text-white/90">Belohnung</span>
                    <span className="font-bold text-yellow-400">
                      {selectedMission.rewardLabel}
                    </span>
                  </div>
                </div>

                <button
                  onClick={continueMission}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-2xl font-bold text-white transition hover:bg-blue-700"
                >
                  Mission fortsetzen
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="min-w-[190px] rounded-2xl border border-cyan-400/10 bg-[#041f24] px-4 py-3">
                <p className="text-xs uppercase text-white/50">Letzter Login: Heute 9:43</p>
                <p className="mt-1 text-xl font-semibold text-white">3 WFT erhalten</p>
              </div>

              <div className="min-w-[190px] rounded-2xl border border-yellow-500/60 bg-[#041f24] px-4 py-3 text-center">
                <p className="text-xs uppercase text-white/50">WFT-Punkte</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {user?.points ?? 0}
                </p>
              </div>

              <div className="min-w-[190px] rounded-2xl border border-cyan-400/10 bg-[#041f24] px-4 py-3 text-center">
                <p className="text-xs uppercase text-white/50">Gehortet: 0.00 WFT</p>
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