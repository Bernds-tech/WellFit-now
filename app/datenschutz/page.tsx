"use client";

import LegalPageLayout from "@/app/components/LegalPageLayout";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

export default function DatenschutzPage() {
  const { language } = useLegalLanguage();

  const t =
    language === "de"
      ? {
          title: "Datenschutzerklärung WellFit",
          s1: "1. Einleitung und Verantwortlichkeit",
          s2: "2. Datenerfassung beim Besuch der Webseite",
          s3: "3. Anmeldung und Web3-Schnittstelle (zkLogin)",
          s4: "4. Besonderheiten unserer Technologie (Edge AI & Cloud Backend)",
          s5: "5. DePIN-Protokoll (Rechenleistung im Schlaf)",
          s6: "6. Blockchain-Transparenz",
          s7: "7. Nutzung durch Minderjährige",
          s8: "8. Deine Rechte (DSGVO & MiCA)",
        }
      : {
          title: "WellFit Privacy Policy",
          s1: "1. Introduction and Responsibility",
          s2: "2. Data collection when visiting the website",
          s3: "3. Login and Web3 interface (zkLogin)",
          s4: "4. Features of our technology (Edge AI & Cloud Backend)",
          s5: "5. DePIN protocol (computing power during sleep)",
          s6: "6. Blockchain transparency",
          s7: "7. Use by minors",
          s8: "8. Your rights (GDPR & MiCA)",
        };

  return (
    <LegalPageLayout title={t.title}>
      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s1}</h2>

        <p>
          {language === "de"
            ? "Willkommen bei WellFit. Wir nehmen den Schutz deiner Daten ernst. Verantwortlich für die Datenverarbeitung auf dieser Webseite ist:"
            : "Welcome to WellFit. We take the protection of your data seriously. The controller responsible for data processing on this website is:"}
        </p>

        <p>
          <strong>WellFit Global Operations</strong>
          <br />
          Turnerstrasse 18
          <br />
          2345 Brunn am Gebirge, Österreich
          <br />
          {language === "de" ? "Kontakt" : "Contact"}:{" "}
          <a
            href="mailto:b.guggennberger@gmail.com"
            className="text-cyan-300 underline underline-offset-4 hover:text-white"
          >
            b.guggennberger@gmail.com
          </a>
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s2}</h2>

        <p>
          <strong>{language === "de" ? "Server-Logfiles:" : "Server log files:"}</strong>{" "}
          {language === "de"
            ? "Beim Aufruf der Seite werden automatisch Informationen wie IP-Adresse, Browsertyp und Zeitstempel übertragen. Dies dient der technischen Sicherheit und Stabilität unserer Systeme."
            : "When visiting the website, information such as IP address, browser type and timestamp is transmitted automatically. This serves the technical security and stability of our systems."}
        </p>

        <p>
          <strong>{language === "de" ? "Cookies:" : "Cookies:"}</strong>{" "}
          {language === "de"
            ? "Wir nutzen notwendige Cookies für die Funktionalität der Seite sowie, nach deiner Zustimmung, Analyse-Cookies, um unser Angebot zu verbessern."
            : "We use necessary cookies for the functionality of the website and, with your consent, analytics cookies to improve our services."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s3}</h2>

        <p>
          <strong>zkLogin:</strong>{" "}
          {language === "de"
            ? "Du kannst dich über bestehende Web2-Accounts wie Google, Apple oder Facebook anmelden."
            : "You can sign in using existing Web2 accounts such as Google, Apple or Facebook."}
        </p>

        <p>
          <strong>{language === "de" ? "Datenschutz-Vorteil:" : "Privacy benefit:"}</strong>{" "}
          {language === "de"
            ? "Durch die SUI-Blockchain-Technologie erhalten wir keine Passwörter oder privaten Profildaten von diesen Anbietern. Es wird lediglich ein kryptografischer Nachweis erstellt, um dein WellFit-Konto sicher mit der Blockchain zu verknüpfen."
            : "Thanks to SUI blockchain technology, we do not receive passwords or private profile data from these providers. Only a cryptographic proof is created to securely link your WellFit account to the blockchain."}
        </p>

        <p>
          <strong>{language === "de" ? "Datenlöschung:" : "Data deletion:"}</strong>{" "}
          {language === "de"
            ? "Wir verpflichten uns zur vollständigen Einhaltung der MiCA-Regulierung. Wenn ein Investor oder Nutzer seinen Account löscht, werden sämtliche nicht gesetzlich aufbewahrungspflichtigen Daten nach einer Frist von 30 Tagen endgültig gelöscht. Eine Wiederherstellung ist nicht möglich. Das Recht auf Löschung nach DSGVO Artikel 17 gilt uneingeschränkt."
            : "We are committed to full compliance with MiCA regulation. If an investor or user deletes their account, all data not subject to statutory retention obligations will be permanently deleted after a period of 30 days. Recovery is not possible. The right to erasure under GDPR Article 17 applies in full."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s4}</h2>

        <p>
          <strong>{language === "de" ? "On-Device Validierung:" : "On-device validation:"}</strong>{" "}
          {language === "de"
            ? "Das Tracking deiner Bewegungen wie z. B. Skelett-Tracking für Kniebeugen findet ausschließlich lokal auf deinem Smartphone statt."
            : "Tracking of your movements, such as skeletal tracking for squats, takes place exclusively locally on your smartphone."}
        </p>

        <p>
          <strong>{language === "de" ? "Keine Video-Cloud:" : "No video cloud:"}</strong>{" "}
          {language === "de"
            ? "Es werden zu keinem Zeitpunkt Videostreams oder Bilder deiner Kamera in die Cloud oder auf unsere Server hochgeladen."
            : "At no time are video streams or camera images uploaded to the cloud or to our servers."}
        </p>

        <p>
          <strong>{language === "de" ? "Sichere Cloud-Verarbeitung:" : "Secure cloud processing:"}</strong>{" "}
          {language === "de"
            ? "Die Verifizierung von Belohnungen, Einkäufe auf dem Marktplatz, PvP-Duelle sowie die Pflege deines digitalen Zwillings werden manipulationssicher auf unserer Server-Infrastruktur verarbeitet."
            : "Reward verification, marketplace purchases, PvP duels and maintenance of your digital twin are processed securely on our server infrastructure."}
        </p>

        <p>
          <strong>{language === "de" ? "Ergebnisspeicherung:" : "Result storage:"}</strong>{" "}
          {language === "de"
            ? 'Lediglich die verifizierte Information, dass eine Übung korrekt ausgeführt wurde ("Proof-of-Activity"), wird gespeichert und anschließend auf der Blockchain verankert.'
            : 'Only the verified information that an exercise was performed correctly ("Proof-of-Activity") is stored and then anchored on the blockchain.'}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s5}</h2>

        <p>
          <strong>{language === "de" ? "Funktionsweise:" : "How it works:"}</strong>{" "}
          {language === "de"
            ? 'Wenn du die Funktion "Buddy-Schlaf-Sync" nutzt, stellt dein Gerät während der Ruhephase ungenutzte Rechenleistung für Simulationen bereit.'
            : 'If you use the "Buddy Sleep Sync" feature, your device provides unused computing power for simulations during rest phases.'}
        </p>

        <p>
          <strong>{language === "de" ? "Sicherheit:" : "Security:"}</strong>{" "}
          {language === "de"
            ? "Diese Prozesse laufen in einer isolierten Umgebung. Es besteht kein Zugriff auf persönliche Dateien, Fotos, Nachrichten oder Kontakte."
            : "These processes run in an isolated environment. There is no access to personal files, photos, messages or contacts."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s6}</h2>

        <p>
          <strong>{language === "de" ? "Öffentliche Daten:" : "Public data:"}</strong>{" "}
          {language === "de"
            ? "Transaktionen mit dem WellFit-Token (WFT) und Statusänderungen deines Avatars sind öffentlich einsehbar."
            : "Transactions involving the WellFit token (WFT) and status changes of your avatar are publicly visible."}
        </p>

        <p>
          <strong>{language === "de" ? "Anonymität:" : "Anonymity:"}</strong>{" "}
          {language === "de"
            ? "Diese Daten sind nur mit deiner Wallet-Adresse verknüpft, nicht mit deinem Klarnamen."
            : "This data is linked only to your wallet address, not to your real name."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s7}</h2>

        <p>
          <strong>{language === "de" ? "Besonderer Schutz:" : "Special protection:"}</strong>{" "}
          {language === "de"
            ? "WellFit bietet spezielle Features für Kinder."
            : "WellFit provides special features for children."}
        </p>

        <p>
          <strong>{language === "de" ? "Eltern-Dashboard:" : "Parent dashboard:"}</strong>{" "}
          {language === "de"
            ? "Erziehungsberechtigte können Ruhezeiten steuern und die Privatsphäre schützen. Es werden keine Inhaltsdaten an Dritte weitergegeben."
            : "Guardians can control quiet times and protect privacy. No content data is shared with third parties."}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold text-cyan-300">{t.s8}</h2>

        <p>
          {language === "de"
            ? "Du hast das Recht auf Auskunft, Berichtigung und Löschung deiner gespeicherten Daten. WellFit verpflichtet sich zur Einhaltung der EU-MiCA-Regulierung."
            : "You have the right to access, correct and delete your stored data. WellFit is committed to complying with EU MiCA regulation."}
        </p>
      </section>

      <p className="pt-4 text-white/70">
        © 2026 WellFit Global Operations. {language === "de" ? "Alle Rechte vorbehalten." : "All rights reserved."}
      </p>
    </LegalPageLayout>
  );
}