import Link from "next/link";

export default function AccountStatusPage() {
  return <main className="flex min-h-screen items-center justify-center bg-[#063f46] px-5 text-white"><section className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center"><h1 className="text-3xl font-black">Kontostatus</h1><p className="mt-4 text-white/80">Dieses Konto ist derzeit gesperrt oder zur Löschung vorgemerkt. Deshalb wurde keine App-Sitzung eröffnet.</p><Link href="/login" className="mt-7 inline-block rounded-xl bg-cyan-300 px-5 py-3 font-black text-[#063f46]">Zurück zum Login</Link></section></main>;
}
