"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HistoryEntry = {
  id: string;
  title: string;
  category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe";
  rewardLabel: string;
  completedAt: string;
  icon: string;
};

export default function HistoryPage() {
  const [brightness, setBrightness] = useState(100);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem("wellfit-history");

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as HistoryEntry[];
        setHistoryEntries(parsed);
      } catch (error) {
        console.error("Fehler beim Laden der History", error);
      }
    }
  }, []);

  const sortedHistory = useMemo(() => {
    return [...historyEntries].sort((a, b) => {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });
  }, [historyEntries]);

  const clearHistory = () => {
    localStorage.removeItem("wellfit-history");
    setHistoryEntries([]);
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
              <h1 className="text-5xl font-bold">History</h1>
              <p className="text-cyan-200">
                Hier findest du alle abgeschlossenen Missionen
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearHistory}
                className="rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2 font-bold text-red-300 hover:bg-red-500/20"
              >
                History löschen
              </button>

              <div className="rounded-full bg-[#073b44] px-4 py-2">
                Verlauf
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

              <div className="relative pb-1 text-2xl font-semibold text-orange-400">
                History
                <span className="absolute left-0 right-0 -bottom-2 h-[3px] rounded-full bg-orange-400" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-28 pr-2">
            {sortedHistory.length === 0 ? (
              <div className="rounded-[30px] bg-[#053841]/90 p-10 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <div className="text-7xl">📜</div>
                <h2 className="mt-4 text-4xl font-bold">Noch keine Einträge</h2>
                <p className="mt-3 text-2xl text-white/75">
                  Sobald du Missionen abschließt, erscheinen sie hier.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[24px] border border-cyan-300/10 bg-[#053841]/90 p-6 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0a3d46] text-4xl">
                          {entry.icon}
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {entry.title}
                          </h3>
                          <p className="mt-1 text-lg text-cyan-200">
                            {entry.category}
                          </p>
                          <p className="mt-1 text-base text-white/60">
                            Abgeschlossen am{" "}
                            {new Date(entry.completedAt).toLocaleString("de-DE")}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xl font-bold text-yellow-400">
                        {entry.rewardLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="min-w-[190px] rounded-2xl border border-cyan-400/10 bg-[#041f24] px-4 py-3">
                <p className="text-xs uppercase text-white/50">Einträge gesamt</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {sortedHistory.length}
                </p>
              </div>

              <div className="min-w-[190px] rounded-2xl border border-yellow-500/60 bg-[#041f24] px-4 py-3 text-center">
                <p className="text-xs uppercase text-white/50">Letzter Eintrag</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {sortedHistory[0]?.icon ?? "—"}
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