export default function MobileHeader() {
  return (
    <header className="rounded-b-[34px] bg-[#04343b] px-5 pb-6 pt-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-100/60">WellFit Mobile</p>
      <h1 className="mt-2 text-4xl font-black leading-none text-white">Heute aktiv</h1>
      <p className="mt-2 text-sm leading-relaxed text-cyan-100/75">
        Handy-Fokus: Missionen spielen, Buddy pflegen, Nutzer analysieren und AR starten.
      </p>
    </header>
  );
}
