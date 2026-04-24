type DashboardHeaderProps = {
  message: string;
  isRealtimeConnected: boolean;
  loadedFromCache: boolean;
  isLoadingUser: boolean;
  hasUser: boolean;
  buddyLevel: number;
};

export default function DashboardHeader({
  message,
  isRealtimeConnected,
  loadedFromCache,
  isLoadingUser,
  hasUser,
  buddyLevel,
}: DashboardHeaderProps) {
  return (
    <header className="mb-4 flex items-start justify-between">
      <div>
        <h1 className="text-5xl font-extrabold leading-none">Dashboard</h1>
        <p className="mt-1 text-lg text-cyan-100/90">{message}</p>
        <p className={`mt-1 text-xs font-semibold ${isRealtimeConnected ? "text-green-300" : "text-yellow-200"}`}>
          Realtime: {isRealtimeConnected ? "verbunden" : loadedFromCache ? "Cache aktiv" : "wird verbunden"}
        </p>
      </div>
      <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-cyan-100">
        Flammi LVL {isLoadingUser && !hasUser ? "..." : buddyLevel}
      </div>
    </header>
  );
}
