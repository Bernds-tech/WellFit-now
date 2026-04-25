"use client";

export default function SettingsHeader({
  isLoadingUser,
  saveMessage,
}: {
  isLoadingUser: boolean;
  saveMessage: string;
}) {
  return (
    <header className="mb-4 flex items-start justify-between">
      <div>
        <h1 className="text-5xl font-extrabold leading-none">
          Einstellungen
        </h1>
        <p className="mt-1 text-lg text-cyan-100/90">
          Verwalte dein Profil, Berechtigungen und App-Verhalten
        </p>
        <p className="mt-1 text-sm text-cyan-100/70">
          {isLoadingUser
            ? "Lade deine gespeicherten Angaben..."
            : saveMessage}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-4 py-2 text-sm text-white/90">
          Synchron
        </button>
        <button className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600">
          Tracker Starten
        </button>
        <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">
          Flammi LVL 1
        </div>
      </div>
    </header>
  );
}
