type HealthProgressCardProps = {
  stepsToday: number;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function HealthProgressCard({ stepsToday }: HealthProgressCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="text-2xl font-bold text-cyan-300">Deine Gesundheit</h2>
      <p className="mt-3 text-lg font-bold text-white">{stepsToday} / 10.000 Schritte</p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/25">
        <div
          className="h-full rounded-full bg-cyan-300 transition-all"
          style={{ width: `${Math.min((stepsToday / 10000) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
