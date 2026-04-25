import { economyConfig } from "@/config/economy";

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function EconomyReserveCard() {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-2xl font-bold text-cyan-300">Economy</h2>
      <p className="text-lg text-white/90">Reserve: {economyConfig.reserve}</p>
      <p className="text-lg text-white/90">Umlauf: {economyConfig.circulating}</p>
    </div>
  );
}
