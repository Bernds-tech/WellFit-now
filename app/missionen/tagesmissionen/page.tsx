"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";

type MissionTab =
  | "Tagesmissionen"
  | "Wochenmissionen"
  | "Abenteuer"
  | "Challenge"
  | "Wettkämpfe"
  | "Favoriten"
  | "History";

type Mission = {
  id: number;
  title: string;
  reward: number;
  category: MissionTab;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  description: string;
  duration: string;
  type: "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
};

const tabs: MissionTab[] = [
  "Tagesmissionen",
  "Wochenmissionen",
  "Abenteuer",
  "Challenge",
  "Wettkämpfe",
  "Favoriten",
  "History",
];

const allMissions: Mission[] = [
  {
    id: 1,
    title: "Tägliche Schritte",
    reward: 25,
    category: "Tagesmissionen",
    difficulty: "Leicht",
    description: "Erreiche heute 5.000 Schritte und halte deinen Bewegungsfluss aktiv.",
    duration: "1 Tag",
    type: "Bewegung",
  },
  {
    id: 2,
    title: "Wasser trinken",
    reward: 10,
    category: "Tagesmissionen",
    difficulty: "Leicht",
    description: "Trinke heute mindestens 2 Liter Wasser für deinen Energiehaushalt.",
    duration: "1 Tag",
    type: "Ernährung",
  },
  {
    id: 3,
    title: "Workout Boost",
    reward: 40,
    category: "Tagesmissionen",
    difficulty: "Mittel",
    description: "Absolviere ein 20-minütiges Workout und verdiene Extra-Punkte.",
    duration: "20 Minuten",
    type: "Workout",
  },
  {
    id: 4,
    title: "7 Tage Aktivserie",
    reward: 120,
    category: "Wochenmissionen",
    difficulty: "Mittel",
    description: "Bleibe 7 Tage am Stück aktiv und halte deine Serie aufrecht.",
    duration: "7 Tage",
    type: "Bewegung",
  },
  {
    id: 5,
    title: "Wochenziel Schritte",
    reward: 150,
    category: "Wochenmissionen",
    difficulty: "Mittel",
    description: "Erreiche insgesamt 35.000 Schritte innerhalb einer Woche.",
    duration: "1 Woche",
    type: "Bewegung",
  },
  {
    id: 6,
    title: "Bergpfad Quest",
    reward: 200,
    category: "Abenteuer",
    difficulty: "Schwer",
    description: "Schließe eine Outdoor-Mission mit Distanz, Steigung und Zielpunkt ab.",
    duration: "1-2 Stunden",
    type: "Abenteuer",
  },
  {
    id: 7,
    title: "Park-Explorer",
    reward: 80,
    category: "Abenteuer",
    difficulty: "Mittel",
    description: "Besuche drei Punkte in deiner Umgebung und erkunde neue Wege.",
    duration: "45 Minuten",
    type: "Abenteuer",
  },
  {
    id: 8,
    title: "30 Minuten Challenge",
    reward: 70,
    category: "Challenge",
    difficulty: "Mittel",
    description: "Halte 30 Minuten aktive Belastung ohne Unterbrechung durch.",
    duration: "30 Minuten",
    type: "Workout",
  },
  {
    id: 9,
    title: "Squad Sprint",
    reward: 110,
    category: "Wettkämpfe",
    difficulty: "Schwer",
    description: "Tritt gegen andere an und erreiche als Erster das Wochenziel.",
    duration: "1 Wettkampf",
    type: "Community",
  },
];

export default function MissionenPage() {
  const [brightness, setBrightness] = useState(100);
  const [activeTab, setActiveTab] = useState<MissionTab>("Tagesmissionen");
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(1);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [historyIds, setHistoryIds] = useState<number[]>([]);
  const [activeMissionIds, setActiveMissionIds] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Quests?");

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-missions");
    const savedHistory = localStorage.getItem("wellfit-mission-history");
    const savedActive = localStorage.getItem("wellfit-active-missions");

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
        console.error("Fehler beim Laden der Favoriten", error);
      }
    }

    if (savedHistory) {
      try {
        setHistoryIds(JSON.parse(savedHistory));
      } catch (error) {
        console.error("Fehler beim Laden der History", error);
      }
    }

    if (savedActive) {
      try {
        setActiveMissionIds(JSON.parse(savedActive));
      } catch (error) {
        console.error("Fehler beim Laden aktiver Missionen", error);
      }
    }
  }, []);

  const filteredMissions = useMemo(() => {
    if (activeTab === "Favoriten") {
      return allMissions.filter((mission) => favoriteIds.includes(mission.id));
    }

    if (activeTab === "History") {
      return allMissions.filter((mission) => historyIds.includes(mission.id));
    }

    return allMissions.filter((mission) => mission.category === activeTab);
  }, [activeTab, favoriteIds, historyIds]);

  useEffect(() => {
    if (filteredMissions.length === 0) {
      setSelectedMissionId(null);
      return;
    }

    const selectedStillVisible = filteredMissions.some(
      (mission) => mission.id === selectedMissionId
    );

    if (!selectedStillVisible) {
      setSelectedMissionId(filteredMissions[0].id);
    }
  }, [filteredMissions, selectedMissionId]);

  const selectedMission =
    allMissions.find((mission) => mission.id === selectedMissionId) ?? null;

  const dailyMissions = allMissions.filter(
    (mission) => mission.category === "Tagesmissionen"
  );
  const favoriteMissions = allMissions.filter((mission) =>
    favoriteIds.includes(mission.id)
  );

  const toggleFavorite = (missionId: number) => {
    const updated = favoriteIds.includes(missionId)
      ? favoriteIds.filter((id) => id !== missionId)
      : [...favoriteIds, missionId];

    setFavoriteIds(updated);
    localStorage.setItem("wellfit-favorite-missions", JSON.stringify(updated));
  };

  const startMission = () => {
    if (!selectedMission || !user) {
      setMessage("Bitte zuerst eine Mission auswählen.");
      return;
    }

    const alreadyActive = activeMissionIds.includes(selectedMission.id);

    if (alreadyActive) {
      setMessage(`Mission läuft bereits: ${selectedMission.title}`);
      return;
    }

    const newPoints = (user.points ?? 0) + selectedMission.reward;

    const updatedUser: User = {
      ...user,
      points: newPoints,
    };

    const updatedActiveMissions = [...activeMissionIds, selectedMission.id];
    const updatedHistory = historyIds.includes(selectedMission.id)
      ? historyIds
      : [selectedMission.id, ...historyIds];

    setUser(updatedUser);
    setActiveMissionIds(updatedActiveMissions);
    setHistoryIds(updatedHistory);
    setMessage(
      `Mission gestartet: ${selectedMission.title} (+${selectedMission.reward} Punkte)`
    );

    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem(
      "wellfit-active-missions",
      JSON.stringify(updatedActiveMissions)
    );
    localStorage.setItem(
      "wellfit-mission-history",
      JSON.stringify(updatedHistory)
    );
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
              <h1 className="text-5xl font-bold">Missionen</h1>
              <p className="text-cyan-200">{message}</p>
            </div>

            <div className="flex items-center gap-3">
              <button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-5 py-2 text-white/90">
                Synchron
              </button>
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
    {tabs.map((tab) => (
      <Link
  key={tab}
  href={
    tab === "Tagesmissionen"
      ? "/missionen/tagesmissionen"
      : tab === "Wochenmissionen"
      ? "/missionen/wochenmissionen"
      : tab === "Abenteuer"
      ? "/missionen/abenteuer"
      : tab === "Challenge"
      ? "/missionen/challenge"
      : tab === "Wettkämpfe"
      ? "/missionen/wettkaempfe"
      : tab === "Favoriten"
      ? "/missionen/favoriten"
      : "/missionen/history"
  }
  className={`relative pb-1 text-2xl transition ${
    activeTab === tab
      ? "font-semibold text-orange-400"
      : "text-white/85 hover:text-white"
  }`}
>
  {tab}
        {activeTab === tab && (
          <span className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-orange-400" />
        )}
      </Link>
    ))}
  </div>
</div>

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-6 overflow-hidden pb-28">
            <div className="min-h-0 space-y-8 overflow-y-auto pr-3 pb-6">
  <div>
    <h2 className="mb-4 text-2xl font-bold text-cyan-300">
      Tages Ziele ({Math.min(dailyMissions.length, 3)}/3)
    </h2>

    <div className="flex gap-4">
      {dailyMissions.slice(0, 1).map((mission) => (
        <div
          key={mission.id}
          onClick={() => setSelectedMissionId(mission.id)}
          className={`flex h-[170px] w-[170px] cursor-pointer flex-col justify-between rounded-[28px] border p-5 transition ${
            selectedMissionId === mission.id
              ? "border-yellow-400 bg-[#07505c]"
              : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="text-4xl">
              {mission.type === "Bewegung" && "👣"}
              {mission.type === "Ernährung" && "💧"}
              {mission.type === "Workout" && "🔥"}
              {mission.type === "Community" && "👥"}
              {mission.type === "Abenteuer" && "🗺️"}
            </div>
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

          <div>
            <p className="text-xl font-bold">{mission.title}</p>
            <p className="mt-2 text-lg font-semibold text-orange-400">
              + {mission.reward} WFT
            </p>
          </div>
        </div>
      ))}

      {[1, 2].map((slot) => (
        <div
          key={slot}
          className="flex h-[170px] w-[170px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/25 bg-white/5 text-white/35"
        >
          <div className="text-3xl">⊕</div>
          <p className="mt-3 text-lg">Freier Slot</p>
        </div>
      ))}
    </div>
  </div>

  <div>
    <h2 className="mb-4 text-2xl font-bold text-yellow-400">
      Deine Favoriten
    </h2>

    <div className="flex gap-4 overflow-x-auto pb-2">
      {favoriteMissions.length > 0 ? (
        favoriteMissions.map((mission) => (
          <div
            key={mission.id}
            onClick={() => setSelectedMissionId(mission.id)}
            className={`flex h-[190px] min-w-[170px] cursor-pointer flex-col justify-between rounded-[28px] border p-5 transition ${
              selectedMissionId === mission.id
                ? "border-yellow-400 bg-[#07505c]"
                : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">
                {mission.type === "Bewegung" && "👣"}
                {mission.type === "Ernährung" && "💧"}
                {mission.type === "Workout" && "🔥"}
                {mission.type === "Community" && "👥"}
                {mission.type === "Abenteuer" && "🗺️"}
              </div>
              <span className="text-2xl text-yellow-400">★</span>
            </div>

            <div>
              <p className="text-xl font-bold">{mission.title}</p>
              <p className="mt-2 text-lg font-semibold text-orange-400">
                + {mission.reward} WFT
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-dashed border-white/20 p-5 text-white/40">
          Noch keine Favoriten gespeichert
        </div>
      )}
    </div>
  </div>

  <div>
    <h2 className="mb-4 text-2xl font-bold text-white">
      Missions-Pool
    </h2>

    <div className="grid grid-cols-4 gap-4">
      {filteredMissions.length > 0 ? (
        filteredMissions.map((mission) => {
          const isFavorite = favoriteIds.includes(mission.id);
          const isActive = activeMissionIds.includes(mission.id);

          return (
            <div
              key={mission.id}
              onClick={() => setSelectedMissionId(mission.id)}
              className={`cursor-pointer rounded-[28px] border p-5 transition ${
                selectedMissionId === mission.id
                  ? "border-yellow-400 bg-[#07505c]"
                  : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="text-4xl">
                  {mission.type === "Bewegung" && "👣"}
                  {mission.type === "Ernährung" && "💧"}
                  {mission.type === "Workout" && "🔥"}
                  {mission.type === "Community" && "👥"}
                  {mission.type === "Abenteuer" && "🗺️"}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(mission.id);
                  }}
                  className={`text-2xl ${
                    isFavorite ? "text-yellow-400" : "text-white/30"
                  }`}
                  aria-label="Favorit umschalten"
                >
                  ★
                </button>
              </div>

              <p className="text-xl font-bold">{mission.title}</p>
              <p className="mt-2 text-sm text-white/60">
                {mission.type} · {mission.difficulty}
              </p>
              <p className="mt-4 text-lg font-semibold text-orange-400">
                + {mission.reward} WFT
              </p>

              {isActive && (
                <p className="mt-3 text-sm font-semibold text-cyan-300">
                  Aktiv
                </p>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-4 rounded-2xl border border-dashed border-white/20 p-5 text-white/40">
          Keine Missionen in diesem Bereich gefunden.
        </div>
      )}
    </div>
  </div>
</div>

            <div className="min-h-0 overflow-y-auto rounded-[32px] bg-[#053841]/90 p-7 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
  {selectedMission ? (
    <>
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

      <div className="mb-4 flex justify-center text-6xl">
        {selectedMission.type === "Bewegung" && "👣"}
        {selectedMission.type === "Ernährung" && "💧"}
        {selectedMission.type === "Workout" && "🔥"}
        {selectedMission.type === "Community" && "👥"}
        {selectedMission.type === "Abenteuer" && "🗺️"}
      </div>

      <h3 className="text-center text-4xl font-bold text-white">
        {selectedMission.title}
      </h3>

      <div className="mt-4 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-3 text-center font-semibold text-fuchsia-300">
        KI-{selectedMission.type} Tracking aktiv
      </div>

      <p className="mt-6 text-center text-lg leading-relaxed text-white/80">
        {selectedMission.description}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-white/80">
          <span>Fortschritt</span>
          <span>0%</span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-black/25">
          <div
            className="h-full rounded-full bg-cyan-300"
            style={{ width: "0%" }}
          />
        </div>

        <p className="mt-3 text-sm text-white/70">
          Fortschritt: 0 / {selectedMission.duration}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4">
        <div className="flex items-center justify-between text-xl">
          <span className="font-semibold text-white/90">Belohnung:</span>
          <span className="font-bold text-yellow-400">
            + {selectedMission.reward} WFT
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-base text-white/80">
        <p>
          <span className="font-semibold text-white">Dauer:</span>{" "}
          {selectedMission.duration}
        </p>
        <p>
          <span className="font-semibold text-white">Schwierigkeit:</span>{" "}
          {selectedMission.difficulty}
        </p>
        <p>
          <span className="font-semibold text-white">Typ:</span>{" "}
          {selectedMission.type}
        </p>
      </div>

      <button
        onClick={startMission}
        className="mt-8 w-full rounded-2xl bg-blue-600 px-6 py-4 text-2xl font-bold text-white transition hover:bg-blue-700"
      >
        + In Slot übernehmen
      </button>
    </>
  ) : (
    <div className="flex h-full items-center justify-center text-white/40">
      Wähle eine Mission
    </div>
  )}
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