"use client";

import MobileBottomNav from "./components/MobileBottomNav";
import MobileFocusCards from "./components/MobileFocusCards";
import MobileHeader from "./components/MobileHeader";
import MobileQuickActions from "./components/MobileQuickActions";
import { mobileFocusCards, mobileQuickActions } from "./lib/mobileHome";

export default function MobileHomePage() {
  return (
    <main className="h-screen overflow-y-auto bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-28 text-white">
      <MobileHeader />
      <MobileFocusCards cards={mobileFocusCards} />
      <MobileQuickActions actions={mobileQuickActions} />

      <section className="px-4 pt-4">
        <div className="rounded-[24px] border border-cyan-200/20 bg-[#042f35]/80 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Produktregel</p>
          <p className="mt-2 text-sm leading-relaxed text-white/72">
            Mobile bleibt bewusst schlank: Missionen, Buddy, Kameraanalyse, Bewegungstest und später AR. Wenn mehrere Punkte sichtbar sind, scrollt diese Ansicht wie eine echte Handy-App.
          </p>
        </div>
      </section>

      <MobileBottomNav activeTab="missions" />
    </main>
  );
}
