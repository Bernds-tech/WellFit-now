"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import { mergeClientBetaProjection, readClientBetaProjection } from "@/lib/economy/clientBetaProjection";
import type { User } from "@/types/user";
import GoogleMissionMap from "../components/GoogleMissionMap";
import {
  fetchAdventureRewardCompletion,
  fetchAdventureTravelSpend,
  type AdventureEconomyMission,
} from "./serverAdventureEconomyApi";

type AdventureCategory = "Alle Orte" | "Tierparks" | "Museen" | "Burgen" | "Parks & Städte";

type Adventure = AdventureEconomyMission & {
  region: string;
  image: string;
  icon: string;
  lat: number;
  lng: number;
  milestones: string[];
};

const categories: AdventureCategory[] = ["Alle Orte", "Tierparks", "Museen", "Burgen", "Parks & Städte"];

const adventures: Adventure[] = [
  {
    id: 1,
    title: "Castle",
    shortLabel: "Ritterburg",
    category: "Burgen",
    region: "Wien",
    description: "Erkunde die historische Rüstkammer und löse knifflige Rätsel aus der Renaissance.",
    reward: 300,
    travelCost: 10,
    image: "/Token.png",
    icon: "🏰",
    lat: 48.205914,
    lng: 16.357956,
    milestones: ["Finde die goldene Rüstung", "Löse das Waffen-Rätsel", "Erreiche den Schlossturm"],
  },
  {
    id: 2,
    title: "Zoo Quest",
    shortLabel: "Tierpark",
    category: "Tierparks",
    region: "Wien",
    description: "Besuche besondere Tierstationen, sammle Wissenspunkte und schalte das Naturabzeichen frei.",
    reward: 180,
    travelCost: 8,
    image: "/Token.png",
    icon: "🦁",
    lat: 48.182963,
    lng: 16.302944,
    milestones: ["Finde das Löwengehege", "Scanne 3 Infopunkte", "Schalte das Naturabzeichen frei"],
  },
  {
    id: 3,
    title: "Museum Run",
    shortLabel: "Museum",
    category: "Museen",
    region: "Wien",
    description: "Entdecke versteckte Artefakte, beantworte Quizfragen und sichere dir Kulturpunkte.",
    reward: 220,
    travelCost: 9,
    image: "/Token.png",
    icon: "🏛️",
    lat: 48.203811,
    lng: 16.361209,
    milestones: ["Finde das Hauptartefakt", "Beantworte 5 Quizfragen", "Entsperre die Spezialgalerie"],
  },
  {
    id: 4,
    title: "City Sprint",
    shortLabel: "Stadtmission",
    category: "Parks & Städte",
    region: "Wien",
    description: "Laufe durch markante Stadtpunkte, sammle Check-ins und schließe den Urban Trail ab.",
    reward: 250,
    travelCost: 12,
    image: "/Token.png",
    icon: "🏙️",
    lat: 48.20849,
    lng: 16.37208,
    milestones: ["Erreiche den Startpunkt", "Sammle 4 Check-ins", "Schließe den Urban Trail ab"],
  },
];

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

export default function AbenteuerPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Abenteuer?");
  const [serverPathLabel, setServerPathLabel] = useState("Spend Preview · Reward Preview · Completion · Projection bereit");
  const [selectedCategory, setSelectedCategory] = useState<AdventureCategory>("Alle Orte");
  const [selectedAdventureId, setSelectedAdventureId] = useState<number>(1);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-adventures");

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
        console.error("Fehler beim Laden der Abenteuer-Favoriten", error);
      }
    }
  }, []);

  const filteredAdventures = useMemo(
    () => selectedCategory === "Alle Orte" ? adventures : adventures.filter((adventure) => adventure.category === selectedCategory),
    [selectedCategory]
  );

  useEffect(() => {
    if (!filteredAdventures.some((adventure) => adventure.id === selectedAdventureId) && filteredAdventures.length > 0) {
      setSelectedAdventureId(filteredAdventures[0].id);
    }
  }, [filteredAdventures, selectedAdventureId]);

  const selectedAdventure = adventures.find((adventure) => adventure.id === selectedAdventureId) ?? adventures[0];

  const adventureMarkers = useMemo(
    () =>
      filteredAdventures.map((adventure) => ({
        id: adventure.id,
        title: adventure.title,
        subtitle: adventure.category,
        icon: adventure.icon,
        lat: adventure.lat,
        lng: adventure.lng,
        status: adventure.category,
      })),
    [filteredAdventures]
  );

  const toggleFavorite = (adventureId: number) => {
    const updated = favoriteIds.includes(adventureId)
      ? favoriteIds.filter((id) => id !== adventureId)
      : [...favoriteIds, adventureId];

    setFavoriteIds(updated);
    localStorage.setItem("wellfit-favorite-adventures", JSON.stringify(updated));
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

  const startAdventure = async () => {
    const projection = readClientBetaProjection(user?.id ?? null);
    const userId = user?.id ?? projection?.userId ?? "adventure-local-beta-user";
    const currentPoints = projection?.points ?? user?.points ?? 0;
    const currentXp = projection?.xp ?? user?.xp ?? 0;
    const currentLevel = projection?.level ?? user?.level ?? 1;
    const currentAvatar = projection?.avatar ?? user?.avatar ?? { hunger: 100, mood: 100, energy: 100, level: currentLevel };

    const alreadyStartedKey = `wellfit-adventure-${selectedAdventure.id}-started`;
    if (localStorage.getItem(alreadyStartedKey)) {
      setMessage(`Abenteuer läuft bereits: ${selectedAdventure.title}`);
      return;
    }

    const spend = await fetchAdventureTravelSpend({
      userId,
      mission: selectedAdventure,
      pointsBalance: currentPoints,
    });

    if (spend.status !== "spend_allowed") {
      setMessage("Nicht genug interne Punkte für den Abenteuer-Zugang.");
      setServerPathLabel(`Access Spend: ${spend.status}`);
      return;
    }

    mergeClientBetaProjection(userId, {
      points: spend.remainingPoints,
      xp: currentXp,
      level: currentLevel,
      avatar: currentAvatar,
      source: "mission_completion",
    });

    localStorage.setItem(alreadyStartedKey, "true");
    setMessage(`Abenteuer-Zugang aktiviert: ${selectedAdventure.title} (-${spend.spendPoints} interne Punkte). ${spend.message}`);
    setServerPathLabel(
      spend.draftCollections.length > 0
        ? `Access-Drafts: ${spend.draftCollections.slice(0, 4).join(" · ")}`
        : "Spend Preview im Fallback"
    );
    syncUserFromProjection(userId);
  };

  const completeAdventure = async () => {
    const projection = readClientBetaProjection(user?.id ?? null);
    const userId = user?.id ?? projection?.userId ?? "adventure-local-beta-user";
    const currentPoints = projection?.points ?? user?.points ?? 0;
    const currentXp = projection?.xp ?? user?.xp ?? 0;
    const currentLevel = projection?.level ?? user?.level ?? 1;
    const currentAvatar = projection?.avatar ?? user?.avatar ?? { hunger: 100, mood: 100, energy: 100, level: currentLevel };
    const startedKey = `wellfit-adventure-${selectedAdventure.id}-started`;
    const completedKey = `wellfit-adventure-${selectedAdventure.id}-completed`;

    if (!localStorage.getItem(startedKey)) {
      setMessage("Bitte zuerst den Abenteuer-Zugang aktivieren, bevor das Abenteuer abgeschlossen wird.");
      return;
    }

    if (localStorage.getItem(completedKey)) {
      setMessage(`Abenteuer bereits abgeschlossen: ${selectedAdventure.title}`);
      return;
    }

    const completion = await fetchAdventureRewardCompletion({
      userId,
      mission: selectedAdventure,
      currentPoints,
      currentXp,
      currentLevel,
    });

    if (completion.status === "completion_blocked") {
      setMessage(`${selectedAdventure.title} wurde servernah blockiert. Keine Punkte vorgemerkt.`);
      setServerPathLabel(`Reward Preview: ${completion.rewardPreviewStatus}`);
      return;
    }

    if (completion.status === "manual_review_required") {
      setMessage(`${selectedAdventure.title} wurde für Review vorgemerkt. Keine direkte Punktegutschrift.`);
      setServerPathLabel(`Reward Preview: ${completion.rewardPreviewStatus}`);
      return;
    }

    mergeClientBetaProjection(userId, {
      points: completion.projectedPoints,
      xp: completion.projectedXp,
      level: currentLevel,
      avatar: {
        ...currentAvatar,
        energy: Math.max(0, (currentAvatar.energy ?? 100) - 3),
        hunger: Math.max(0, (currentAvatar.hunger ?? 100) - 2),
      },
      source: "mission_completion",
    });

    localStorage.setItem(completedKey, "true");
    setMessage(`${selectedAdventure.title} abgeschlossen: +${completion.approvedPointsPreview} interne Punkte. ${completion.message} ${completion.buddySyncMessage}`);
    setServerPathLabel(
      completion.draftCollections.length > 0
        ? `Reward-Drafts: ${completion.draftCollections.slice(0, 4).join(" · ")}`
        : "Reward Preview · Completion · Projection im Fallback"
    );
    syncUserFromProjection(userId);
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center">
            <Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="object-contain" priority />
          </div>

          <nav className="space-y-2 text-[14px]">
            <Link href="/dashboard" className="block text-white/80">Dashboard</Link>
            <div className="font-bold text-orange-400">Missionen</div>
            <div className="text-white/80">Mein KI-Buddy</div>
            <div className="text-white/80">Marktplatz</div>
            <div className="text-white/80">Leaderboard</div>
            <div className="text-white/80">Punkte-Shop</div>
            <div className="text-white/80">Analytics & Stats</div>
          </nav>

          <div className="mt-5 border-t border-cyan-400/10 pt-4">
            <div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div>
            <label className="mb-1 block text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-right text-sm text-white/70">{brightness}%</div>
          </div>

          <div className="mt-auto pt-4">
            <div className="space-y-2 text-[14px]">
              <Link href="/einstellungen" className="block text-white/80">Einstellungen</Link>
              <Link href="/datenschutz" className="block text-white/80">Datenschutz</Link>
              <Link href="/agb" className="block text-white/80">AGB</Link>
              <Link href="/impressum" className="block text-white/80">Impressum</Link>
              <Link href="/faq" className="block text-white/80">FAQ</Link>
              <Link href="/hilfe" className="block text-white/80">Hilfe</Link>
            </div>
            <div className="mt-4 border-t border-cyan-400/10 pt-3">
              <button className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button>
            </div>
          </div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Abenteuer</h1>
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
              <Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link>
              <Link href="/missionen/wochenmissionen" className="pb-1 text-base text-white/85 hover:text-white">Wochenmissionen</Link>
              <div className="relative pb-1 text-base font-semibold text-orange-400">
                Abenteuer
                <span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
              </div>
              <Link href="/missionen/challenge" className="pb-1 text-base text-white/85 hover:text-white">Challenge</Link>
              <Link href="/missionen/wettkaempfe" className="pb-1 text-base text-white/85 hover:text-white">Wettkämpfe</Link>
              <Link href="/missionen/favoriten" className="pb-1 text-base text-white/85 hover:text-white">Favoriten</Link>
              <Link href="/missionen/history" className="pb-1 text-base text-white/85 hover:text-white">History</Link>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[2.2fr_0.85fr] gap-4 overflow-hidden pb-20">
            <div className="relative min-h-0 overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#07171d]/70">
              <GoogleMissionMap
                title="Google Maps Abenteuer"
                subtitle="Standort automatisch · bewegen · Abenteuerorte wählen"
                markers={adventureMarkers}
                selectedMarkerId={selectedAdventureId}
                onSelectMarker={setSelectedAdventureId}
                zoom={12}
                minHeightClassName="h-full min-h-[520px]"
                autoRequestLocation
              />
              <div className="absolute bottom-5 left-5 z-10 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-[16px] border px-5 py-3 text-base font-bold transition ${
                      selectedCategory === category
                        ? "border-cyan-200 bg-cyan-300 text-black"
                        : "border-white/20 bg-black/55 text-white hover:bg-black/70"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#032732]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.2)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex h-[120px] w-full items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[#062c37]">
                    <Image
                      src={selectedAdventure.image}
                      alt={selectedAdventure.title}
                      width={170}
                      height={110}
                      className="max-h-[110px] w-auto object-contain"
                    />
                  </div>
                  <div className="inline-block rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">
                    {selectedAdventure.title.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedAdventure.id)}
                  className={`text-2xl ${favoriteIds.includes(selectedAdventure.id) ? "text-yellow-400" : "text-white/30"}`}
                >
                  ★
                </button>
              </div>

              <p className="text-sm leading-relaxed text-white/85">{selectedAdventure.description}</p>

              <div className="mt-5 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Bewegungsziel</p>
                <p className="mt-2 text-xs leading-relaxed text-white/65">WellFit soll dich zum echten Ort bringen. Der kleine interne Zugang ist keine Reisegebühr, sondern ein Beta-Sink für das Abenteuer-Erlebnis.</p>
              </div>

              <div className="mt-5">
                <h3 className="text-base font-bold uppercase tracking-wide text-cyan-300">Missions-Meilensteine</h3>
                <div className="mt-3 space-y-3">
                  {selectedAdventure.milestones.map((milestone) => (
                    <div key={milestone} className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#082c39] px-3 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg text-yellow-500">🔒</div>
                      <p className="text-sm text-white/90">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-[18px] border border-yellow-500/30 bg-yellow-500/10 px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-white/70">Max. Beta-Belohnung</p>
                    <p className="mt-1 text-3xl font-extrabold text-yellow-400">bis zu {selectedAdventure.reward} interne Punkte</p>
                  </div>
                  <div className="text-3xl">🏅</div>
                </div>
                <p className="mt-2 text-xs text-white/60">Interne Beta-Punkte. Die Server-Preview kann die finale Gutschrift cappen oder Review verlangen. Keine Token, keine NFTs, keine Auszahlung.</p>
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={startAdventure}
                  className="w-full rounded-[18px] bg-orange-500 px-4 py-3 text-base font-extrabold text-white transition hover:bg-orange-600"
                >
                  Abenteuer-Zugang aktivieren ({selectedAdventure.travelCost} interne Punkte)
                </button>
                <button
                  onClick={completeAdventure}
                  className="w-full rounded-[18px] bg-blue-600 px-4 py-3 text-base font-extrabold text-white transition hover:bg-blue-700"
                >
                  Abenteuer prüfen & abschließen (bis zu +{selectedAdventure.reward} interne Punkte)
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2">
                <p className="text-[10px] uppercase text-white/50">Letzter Login: Heute 9:43</p>
                <p className="mt-1 text-sm font-semibold text-white">Interne Beta aktiv</p>
              </div>
              <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">Interne Punkte</p>
                <p className="mt-1 text-lg font-bold text-white">{user?.points ?? 0}</p>
              </div>
              <div className="min-w-[220px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">Beta-Hinweis</p>
                <p className="mt-1 text-xs font-semibold text-white/70">Keine Token · keine NFTs · keine Auszahlung</p>
              </div>
              <div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center">
                <p className="text-sm font-semibold text-yellow-400">⚠ Server-Event vorbereitet</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>X</span><span>in</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
