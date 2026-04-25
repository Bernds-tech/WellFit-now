type BuddyStoryBoxProps = {
  story: string;
  message: string;
};

export default function BuddyStoryBox({ story, message }: BuddyStoryBoxProps) {
  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Tagesreaktion</p>
      <h2 className="mt-1 text-2xl font-black text-cyan-300">Was Flammi gerade erlebt</h2>
      <p className="mt-4 text-base leading-relaxed text-white/82">{story}</p>
      <div className="mt-4 rounded-2xl bg-black/18 p-3 text-sm font-semibold text-yellow-100">
        {message}
      </div>
    </section>
  );
}
