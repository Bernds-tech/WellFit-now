type MobileSettingsPanelProps = {
  title: string;
  description: string;
  status: string;
  children?: React.ReactNode;
};

export default function MobileSettingsPanel({ title, description, status, children }: MobileSettingsPanelProps) {
  return (
    <section className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
        </div>
        <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#042f35]">{status}</span>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}
