"use client";

import AppShell from "@/app/components/AppShell";
import Beta1AdminPanel from "@/components/admin/Beta1AdminPanel";

export default function Beta1AdminPage() {
  return (
    <AppShell contentClassName="px-7 py-5 pb-4 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold">Beta-1 Admin Panel Integration</h1>
        <p className="text-sm text-cyan-50/85">Diese Ansicht nutzt ausschließlich bestehende Beta-1 Admin-Callables. Finale Autorität bleibt serverseitig.</p>
        <Beta1AdminPanel />
      </div>
    </AppShell>
  );
}
