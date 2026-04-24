import Link from "next/link";
import { Language, loginContent } from "./loginContent";

export default function LoginFooter({ language }: { language: Language }) {
  const t = loginContent[language];

  return (
    <footer className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-[17px] text-white/90">
      <div className="flex gap-8">
        <Link href="/datenschutz">{t.privacy}</Link>
        <Link href="/impressum">{t.imprint}</Link>
        <Link href="/agb">{t.terms}</Link>
        <Link href="/faq">{t.faq}</Link>
      </div>

      <div className="flex items-center gap-6 text-[26px] font-bold">
        <span>f</span>
        <span>in</span>
        <span>x</span>
      </div>
    </footer>
  );
}
