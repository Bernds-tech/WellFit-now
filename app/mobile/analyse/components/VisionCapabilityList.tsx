import type { VisionCapability } from "@/lib/vision/visionTypes";

type VisionCapabilityListProps = {
  capabilities: VisionCapability[];
};

const statusLabel = {
  ready: "bereit",
  planned: "geplant",
  blocked: "blockiert",
};

export default function VisionCapabilityList({ capabilities }: VisionCapabilityListProps) {
  return (
    <section className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Analyse-Module</p>
      <h2 className="mt-1 text-2xl font-black text-cyan-200">Was vorbereitet ist</h2>
      <div className="mt-4 grid gap-3">
        {capabilities.map((capability) => (
          <div key={capability.title} className="rounded-2xl bg-black/18 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-white">{capability.title}</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-bold text-cyan-100">
                {statusLabel[capability.status]}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/62">{capability.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
