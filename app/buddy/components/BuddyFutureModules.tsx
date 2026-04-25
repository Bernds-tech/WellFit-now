const modules = [
  {
    title: "Skeleton Tracking",
    status: "Phase 2",
    text: "Körperpunkte erkennen, Übungen mitzählen und saubere Wiederholungen prüfen.",
  },
  {
    title: "Face Tracking",
    status: "Phase 2",
    text: "Gesicht und Mimik nur nach Zustimmung analysieren, ohne medizinische Diagnose.",
  },
  {
    title: "AR-Buddy",
    status: "Phase 3",
    text: "Flammi läuft später sichtbar im echten Raum herum, wenn du durch das Handy schaust.",
  },
];

export default function BuddyFutureModules() {
  return (
    <section className="grid grid-cols-3 gap-4">
      {modules.map((module) => (
        <div key={module.title} className="rounded-[24px] bg-[#053841]/70 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-cyan-300">{module.title}</h3>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-white/70">{module.status}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/62">{module.text}</p>
        </div>
      ))}
    </section>
  );
}
