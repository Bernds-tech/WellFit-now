import { Language, loginContent } from "./loginContent";

export default function LoginHero({ language }: { language: Language }) {
  const t = loginContent[language];

  return (
    <>
      <div className="absolute left-1/2 top-[20%] w-[72%] -translate-x-1/2 text-center">
        <h1 className="text-5xl font-bold leading-[1.18] tracking-tight xl:text-6xl 2xl:text-[5.8rem]">
          {t.headline}
        </h1>
      </div>

      <div className="absolute bottom-40 left-20 max-w-[520px] text-left">
        <p className="text-[2.15rem] leading-[1.45] xl:text-[2.35rem]">
          {t.intro}
        </p>
        <p className="mt-6 text-lg text-white/55">{t.comingSoon}</p>
      </div>
    </>
  );
}
