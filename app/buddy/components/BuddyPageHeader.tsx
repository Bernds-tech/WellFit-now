type BuddyPageHeaderProps = {
  hasUser: boolean;
  fallbackMessage: string;
  isRealtimeConnected: boolean;
  loadedFromCache: boolean;
  isSavingBuddy: boolean;
};

export default function BuddyPageHeader({
  hasUser,
  fallbackMessage,
  isRealtimeConnected,
  loadedFromCache,
  isSavingBuddy,
}: BuddyPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-4xl font-extrabold leading-none md:text-5xl">Mein KI-Buddy</h1>
        <p className="mt-2 text-base text-cyan-100/90 md:text-lg">
          {hasUser ? "Dein lebendiger WellFit-Begleiter" : fallbackMessage}
        </p>
        <p className={`mt-1 text-xs font-semibold ${isRealtimeConnected ? "text-green-300" : "text-yellow-200"}`}>
          Realtime: {isRealtimeConnected ? "verbunden" : loadedFromCache ? "Cache aktiv" : "wird verbunden"}
        </p>
      </div>
      <div className="w-fit rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">
        {isSavingBuddy ? "Speichert..." : "Phase 1 MVP"}
      </div>
    </header>
  );
}
