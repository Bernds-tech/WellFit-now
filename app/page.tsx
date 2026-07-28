import type { Metadata } from "next";
import PublicLandingV5 from "./components/landing/PublicLandingV5";

export const metadata: Metadata = {
  title: "WellFit – Dein Abenteuer für Körper & Geist",
  description:
    "WellFit verbindet Bewegung, reale Missionen, WFXP, einen persönlichen Buddy und gemeinschaftliche Erlebnisse.",
};

export default function Home() {
  return <PublicLandingV5 />;
}
