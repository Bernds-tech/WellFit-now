type BuddyStatusCardProps = {
  buddyEnergy: number;
  buddyHunger: number;
  foodPrice: number;
  onFeedBuddy?: () => void;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function BuddyStatusCard({
  buddyEnergy,
  buddyHunger,
  foodPrice,
  onFeedBuddy,
}: BuddyStatusCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-2xl font-bold text-cyan-300">Mein Begleiter</h2>
      <div className="text-4xl">🐉</div>
      <p className="mt-3 text-lg">Energie: {buddyEnergy}%</p>
      <p className="mt-1 text-lg">Hunger: {buddyHunger}%</p>
      <p className="mt-3 text-sm text-cyan-100/70">Futterpreis: {foodPrice} Punkte</p>
      <button
        onClick={onFeedBuddy}
        className="mt-3 rounded-lg bg-cyan-400 px-3 py-1 text-sm font-bold text-black hover:bg-cyan-300"
      >
        Füttern
      </button>
    </div>
  );
}
