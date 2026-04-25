type PointsBalanceCardProps = {
  pointsBalance: number;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function PointsBalanceCard({ pointsBalance }: PointsBalanceCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-2xl font-bold text-cyan-300">Punkte</h2>
      <p className="text-4xl font-extrabold leading-tight">{pointsBalance} Punkte</p>
    </div>
  );
}
