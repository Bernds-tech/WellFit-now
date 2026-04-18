"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";

type AdventureCategory =
  | "Alle Orte"
  | "Tierparks"
  | "Museen"
  | "Burgen"
  | "Parks & Städte";

type Adventure = {
  id: number;
  title: string;
  shortLabel: string;
  category: AdventureCategory;
  region: string;
  description: string;
  reward: number;
  travelCost: number;
  image: string;
  icon: string;
  position: {
    top: string;
    left: string;
  };
  milestones: string[];
};

const categories: AdventureCategory[] = [
  "Alle Orte",
  "Tierparks",
  "Museen",
  "Burgen",
  "Parks & Städte",
];

const adventures: Adventure[] = [
  {
    id: 1,
    title: "Castle",
    shortLabel: "Ritterburg",
    category: "Burgen",
    region: "Europa",
    description:
      "Erkunde die historische Rüstkammer und löse knifflige Rätsel aus der Renaissance.",
    reward: 300,
    travelCost: 10,
    image: "/Token.png",
    icon: "🏰",
    position: { top: "42%", left: "42%" },
    milestones: [
      "Finde die goldene Rüstung",
      "Löse das Waffen-Rätsel",
      "Erreiche den Schlossturm",
    ],
  },
  {
    id: 2,
    title: "Zoo Quest",
    shortLabel: "Tierpark",
    category: "Tierparks",
    region: "Nordamerika",
    description:
      "Besuche besondere Tierstationen, sammle Wissenspunkte und schalte das Naturabzeichen frei.",
    reward: 180,
    travelCost: 8,
    image: "/Token.png",
    icon: "🦁",
    position: { top: "50%", left: "12%" },
    milestones: [
      "Finde das Löwengehege",
      "Scanne 3 Infopunkte",
      "Schalte das Naturabzeichen frei",
    ],
  },
  {
    id: 3,
    title: "Museum Run",
    shortLabel: "Museum",
    category: "Museen",
    region: "Europa",
    description:
      "Entdecke versteckte Artefakte, beantworte Quizfragen und sichere dir Kulturpunkte.",
    reward: 220,
    travelCost: 9,
    image: "/Token.png",
    icon: "🏛️",
    position: { top: "40%", left: "39%" },
    milestones: [
      "Finde das Hauptartefakt",
      "Beantworte 5 Quizfragen",
      "Entsperre die Spezialgalerie",
    ],
  },
  {
    id: 4,
    title: "City Sprint",
    shortLabel: "Stadtmission",
    category: "Parks & Städte",
    region: "Asien",
    description:
      "Laufe durch markante Stadtpunkte, sammle Check-ins und schließe den Urban Trail ab.",
    reward: 250,
    travelCost: 12,
    image: "/Token.png",
    icon: "🏙️",
    position: { top: "49%", left: "83%" },
    milestones: [
      "Erreiche den Startpunkt",
      "Sammle 4 Check-ins",
      "Schließe den Urban Trail ab",
    ],
  },
];

export default function AbenteuerPage() {
  const [brightness, setBrightness] = useState(100);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Quests?");
  const [selectedCategory, setSelectedCategory] =
    useState<AdventureCategory>("Alle Orte");
  const [selectedAdventureId, setSelectedAdventureId] = useState<number>(1);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-adventures");

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
        console.error("Fehler beim Laden der Abenteuer-Favoriten", error);
      }
    }
  }, []);

  const filteredAdventures = useMemo(() => {
    if (selectedCategory === "Alle Orte") {
      return adventures;
    }

    return adventures.filter(
      (adventure) => adventure.category === selectedCategory
    );
  }, [selectedCategory]);

  useEffect(() => {
    const stillVisible = filteredAdventures.some(
      (adventure) => adventure.id === selectedAdventureId
    );

    if (!stillVisible && filteredAdventures.length > 0) {
      setSelectedAdventureId(filteredAdventures[0].id);
    }
  }, [filteredAdventures, selectedAdventureId]);

  const selectedAdventure =
    adventures.find((adventure) => adventure.id === selectedAdventureId) ??
    adventures[0];

  const toggleFavorite = (adventureId: number) => {
    const updated = favoriteIds.includes(adventureId)
      ? favoriteIds.filter((id) => id !== adventureId)
      : [...favoriteIds, adventureId];

    setFavoriteIds(updated);
    localStorage.setItem(
      "wellfit-favorite-adventures",
      JSON.stringify(updated)
    );
  };

  const startAdventure = () => {
    if (!user) {
      setMessage("Bitte zuerst registrieren oder einloggen.");
      return;
    }

    const currentPoints = user.points ?? 0;

    if (currentPoints < selectedAdventure.travelCost) {
      setMessage("Nicht genug WFT für diese Reise.");
      return;
    }

    const alreadyStartedKey = `wellfit-adventure-${selectedAdventure.id}-started`;
    const alreadyStarted = localStorage.getItem(alreadyStartedKey);

    if (alreadyStarted) {
      setMessage(`Abenteuer läuft bereits: ${selectedAdventure.title}`);
      return;
    }

    const newPoints = currentPoints - selectedAdventure.travelCost;

    const updatedUser: User = {
      ...user,
      points: newPoints,
    };

    setUser(updatedUser);
    setMessage(
      `Reise gestartet: ${selectedAdventure.title} (-${selectedAdventure.travelCost} WFT)`
    );

    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem(alreadyStartedKey, "true");
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
              <h1 className="text-5xl font-bold">Abenteuer</h1>
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
              <div className="relative pb-1 text-2xl font-semibold text-orange-400">
                Abenteuer
                <span className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-orange-400" />
              </div>
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

          <div className="grid min-h-0 flex-1 grid-cols-[2.2fr_0.85fr] gap-6 overflow-hidden pb-28">
            <div className="relative min-h-0 overflow-hidden rounded-[28px] border border-cyan-300/10 bg-[#07171d]/70">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06), transparent 25%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.05), transparent 20%), linear-gradient(to bottom right, rgba(0,0,0,0.72), rgba(0,0,0,0.86))",
                }}
              />

              <div className="absolute left-10 top-10 z-10">
                <h2 className="text-6xl font-extrabold text-white">
                  🌍 Globale Abenteuer
                </h2>
                <p className="mt-4 text-2xl text-cyan-300">
                  Drehe die Weltkugel, zoome hinein und wähle deine nächste Mission.
                </p>
              </div>

              <div className="absolute inset-0">
                <div className="absolute left-[12%] top-[48%] text-6xl text-cyan-300 drop-shadow-[0_0_12px_rgba(50,220,255,0.8)]">
                  ✦
                </div>

                {filteredAdventures.map((adventure) => (
                  <button
                    key={adventure.id}
                    onClick={() => setSelectedAdventureId(adventure.id)}
                    className={`absolute flex h-16 w-16 items-center justify-center rounded-full border-4 text-3xl shadow-[0_0_22px_rgba(255,255,255,0.4)] transition ${
                      selectedAdventureId === adventure.id
                        ? "border-orange-300 bg-orange-500/90"
                        : "border-cyan-200/60 bg-cyan-400/30 hover:bg-cyan-300/40"
                    }`}
                    style={{
                      top: adventure.position.top,
                      left: adventure.position.left,
                    }}
                  >
                    {adventure.icon}
                  </button>
                ))}
              </div>

              <div className="absolute bottom-8 left-8 z-10 flex flex-wrap gap-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-[22px] border px-8 py-5 text-2xl font-bold transition ${
                      selectedCategory === category
                        ? "border-cyan-200 bg-cyan-300 text-black"
                        : "border-white/20 bg-black/35 text-white hover:bg-black/50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto rounded-[28px] border border-cyan-300/10 bg-[#032732]/95 p-7 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex h-[180px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[#062c37]">
                    <Image
                      src={selectedAdventure.image}
                      alt={selectedAdventure.title}
                      width={240}
                      height={160}
                      className="max-h-[160px] w-auto object-contain"
                    />
                  </div>

                  <div className="inline-block rounded-xl bg-cyan-500/20 px-4 py-2 text-xl font-bold text-cyan-300">
                    {selectedAdventure.title.toUpperCase()}
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorite(selectedAdventure.id)}
                  className={`text-4xl ${
                    favoriteIds.includes(selectedAdventure.id)
                      ? "text-yellow-400"
                      : "text-white/30"
                  }`}
                >
                  ★
                </button>
              </div>

              <p className="text-2xl leading-relaxed text-white/85">
                {selectedAdventure.description}
              </p>

              <div className="mt-8">
                <h3 className="text-2xl font-bold uppercase tracking-wide text-cyan-300">
                  Missions-Meilensteine
                </h3>

                <div className="mt-5 space-y-4">
                  {selectedAdventure.milestones.map((milestone) => (
                    <div
                      key={milestone}
                      className="flex items-center gap-5 rounded-[22px] border border-white/10 bg-[#082c39] px-5 py-5"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/35 text-3xl text-yellow-500">
                        🔒
                      </div>
                      <p className="text-2xl text-white/90">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-[24px] border border-yellow-500/30 bg-yellow-500/10 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl uppercase text-white/70">
                      Gesamt-Belohnung
                    </p>
                    <p className="mt-2 text-5xl font-extrabold text-yellow-400">
                      {selectedAdventure.reward} WFT
                    </p>
                  </div>

                  <div className="text-5xl">🪙</div>
                </div>
              </div>

              <button
                onClick={startAdventure}
                className="mt-8 w-full rounded-[24px] bg-orange-500 px-6 py-5 text-3xl font-extrabold text-white transition hover:bg-orange-600"
              >
                ✈ Reise antreten ({selectedAdventure.travelCost} WFT)
              </button>
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