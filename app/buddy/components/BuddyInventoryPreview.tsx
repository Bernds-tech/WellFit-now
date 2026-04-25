import { buddyPreviewItems } from "../lib/buddyInventoryPreview";

export default function BuddyInventoryPreview() {
  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Inventory & Shop</p>
          <h2 className="mt-1 text-2xl font-black text-cyan-300">Buddy-Items</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">Punkte-Loop</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {buddyPreviewItems.map((item) => (
          <div key={item.name} className="rounded-2xl bg-black/18 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{item.name}</h3>
                <p className="mt-1 text-xs font-bold text-cyan-200">{item.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-yellow-300">{item.price} P</p>
                <p className="text-xs text-white/45">{item.status === "mvp" ? "MVP" : "später"}</p>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
