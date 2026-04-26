"use client";

import Link from "next/link";
import MobileBottomNav from "../components/MobileBottomNav";
import MobileSettingsPanel from "./components/MobileSettingsPanel";

export default function MobileEinstellungenPage() {
  return (
    <main className="h-screen overflow-y-auto bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-32 text-white">
      <section className="px-4 pt-4">
        <div className="rounded-[30px] bg-[#04343b] p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100/55">Mobile Setup</p>
          <h1 className="mt-2 text-4xl font-black leading-none">Einstellungen</h1>
          <p className="mt-3 text-sm leading-relaxed text-cyan-100/75">
            Nur die wichtigsten Handy-Funktionen: Kamera, Bewegungssensoren, Datenschutz, Buddy und Testmodus.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          <MobileSettingsPanel
            title="Kamera & Analyse"
            description="Für Pose Tracking, Face Signals, Übungszählung und spätere AR-Missionen. Kamera startet nie automatisch ohne Kontextaktion."
            status="wichtig"
          >
            <Link href="/mobile/analyse" className="block rounded-2xl bg-orange-400 px-4 py-3 text-center text-sm font-black text-[#042f35]">
              Analyse öffnen
            </Link>
          </MobileSettingsPanel>

          <MobileSettingsPanel
            title="Bewegungssensoren"
            description="Browser-Test für Schritte, Gehen, Laufen und grobe Fahrzeugbewegung. Später ersetzen wir das in der App durch native Sensoren."
            status="Test"
          >
            <Link href="/mobile/bewegung" className="block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white">
              Bewegung testen
            </Link>
          </MobileSettingsPanel>

          <MobileSettingsPanel
            title="Buddy Kurzpflege"
            description="Flammi füttern, pflegen, spielen und sauber halten. Keine Desktop-Ansichten in der mobilen App."
            status="aktiv"
          >
            <Link href="/mobile/buddy" className="block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white">
              Buddy öffnen
            </Link>
          </MobileSettingsPanel>

          <MobileSettingsPanel
            title="AR-Modus"
            description="Später läuft Flammi im Vorder- oder Hintergrund durch den echten Raum. Aktuell ist der AR-Buddy als Kamera-Overlay vorbereitet."
            status="bald"
          >
            <Link href="/mobile/missionen/squat" className="block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-black text-white">
              Kamera-Mission testen
            </Link>
          </MobileSettingsPanel>

          <MobileSettingsPanel
            title="Datenschutz"
            description="Rohbilder und Videos werden nicht standardmäßig gespeichert. Tracking speichert Ergebnisdaten wie Wiederholungen, Qualität und Signale."
            status="Pflicht"
          />
        </div>
      </section>

      <div className="h-8" />
      <MobileBottomNav activeTab="settings" />
    </main>
  );
}
