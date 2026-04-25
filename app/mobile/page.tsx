"use client";

import MobileBottomNav from "./components/MobileBottomNav";
import MobileFocusCards from "./components/MobileFocusCards";
import MobileHeader from "./components/MobileHeader";
import MobileQuickActions from "./components/MobileQuickActions";
import { mobileFocusCards, mobileQuickActions } from "./lib/mobileHome";

export default function MobileHomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-24 text-white">
      <MobileHeader />
      <MobileFocusCards cards={mobileFocusCards} />
      <MobileQuickActions actions={mobileQuickActions} />

      <section className="px-4 pt-4">
        <div className="rounded-[24px] border border-cyan-200/20 bg-[#042f35]/80 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Produktregel</p>
          <p className="mt-2 text-sm leading-relaxed text-white/72">
            Mobile bleibt bewusst schlank: keine komplexen Marktplatz-, Token-, Leaderboard- oder Analytics-Funktionen. Das Handy ist für Missionen, Buddy, Kameraanalyse und AR.
          </p>
        </div>
      </section>

      <MobileBottomNav activeTab="missions" />
    </main>
  );
}
