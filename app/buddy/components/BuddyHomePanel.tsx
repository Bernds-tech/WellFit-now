import type { BuddyState } from "../types";

type BuddyHomePanelProps = {
  buddy: BuddyState;
};

export default function BuddyHomePanel({ buddy }: BuddyHomePanelProps) {
  const isMessy = buddy.status === "messy";
  const isGone = buddy.status === "ranAway";

  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Zuhause</p>
      <h2 className="mt-1 text-2xl font-black text-cyan-300">Drachenhorst</h2>
      <div className="mt-4 rounded-[22px] bg-black/18 p-4">
        <div className="grid h-[120px] place-items-center rounded-2xl bg-cyan-100/8 text-5xl">
          {isGone ? "👣" : isMessy ? "🧹" : "🏠"}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          {isGone
            ? "Flammi ist gerade nicht im Horst. Später startet hier die Spurensuche."
            : isMessy
              ? "Im Horst ist ein kleines Chaos entstanden. Aufräumen stärkt Verantwortung und Bindung."
              : "Der Horst ist Flammis sicherer Ort. Später kannst du ihn mit Items, Skins und Trophäen ausbauen."}
        </p>
      </div>
    </section>
  );
}
