"use client";

import LegalPageLayout from "@/app/components/LegalPageLayout";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

export default function ImpressumPage() {
  const { language } = useLegalLanguage();

  const t =
    language === "de"
      ? {
          title: "Impressum",
          section1: "Angaben gemäß § 5 ECG und § 25 MedienG",
          publisher: "Herausgeber & Betreiber:",
          contact: "Kontakt:",
          status: "Dokumenten-Status:",
          section2: "Rechtliche Hinweise & Haftungsausschluss",
          purpose: "Informationszweck:",
          future: "Zukunftsgerichtete Aussagen:",
          risk: "Risikohinweis Krypto-Assets:",
          mica: "Regulatorik (MiCA):",
          rights: "Alle Rechte vorbehalten.",
        }
      : {
          title: "Legal Notice",
          section1: "Information according to § 5 ECG and § 25 MedienG",
          publisher: "Publisher & Operator:",
          contact: "Contact:",
          status: "Document status:",
          section2: "Legal Notice & Disclaimer",
          purpose: "Purpose of information:",
          future: "Forward-looking statements:",
          risk: "Crypto asset risk notice:",
          mica: "Regulation (MiCA):",
          rights: "All rights reserved.",
        };

  return (
    <LegalPageLayout title={t.title}>
      {/* SECTION 1 */}
      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.section1}
        </h2>

        <p className="mb-6">
          <strong>{t.publisher}</strong>
          <br />
          WellFit Global Operations
          <br />
          Turnerstrasse 18
          <br />
          2345 Brunn am Gebirge
          <br />
          Österreich
        </p>

        <p className="mb-6">
          <strong>{t.contact}</strong>
          <br />
          E-Mail:{" "}
          <a
            href="mailto:b.guggennberger@gmail.com"
            className="text-cyan-300 underline underline-offset-4 hover:text-white"
          >
            b.guggennberger@gmail.com
          </a>
          <br />
          Webseite:{" "}
          <a
            href="https://www.wellfit-now.io"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-300 underline underline-offset-4 hover:text-white"
          >
            www.wellfit-now.io
          </a>
        </p>

        <p>
          <strong>{t.status}</strong>
          <br />
          {language === "de"
            ? "Version: 3.0 Master-Execution"
            : "Version: 3.0 Master Execution"}
          <br />
          {language === "de"
            ? "Datum: Februar 2026"
            : "Date: February 2026"}
        </p>
      </section>

      {/* SECTION 2 */}
      <section className="mb-6">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.section2}
        </h2>

        <p className="mb-5">
          <strong>{t.purpose}</strong>
          <br />
          {language === "de"
            ? "Dieses Online-Angebot dient ausschließlich Informationszwecken und stellt keine Anlageberatung dar. Es handelt sich nicht um einen Prospekt im Sinne der Kapitalmarktgesetze und stellt keine Aufforderung zum Kauf oder Verkauf von Wertpapieren oder digitalen Vermögenswerten dar."
            : "This online offering is provided solely for information purposes and does not constitute investment advice. It is not a prospectus within the meaning of capital market law and does not constitute an invitation to buy or sell securities or digital assets."}
        </p>

        <p className="mb-5">
          <strong>{t.future}</strong>
          <br />
          {language === "de"
            ? "Die dargestellten Prognosen basieren auf Marktanalysen und internen Berechnungen. Diese Aussagen unterliegen Risiken und Unsicherheiten; tatsächliche Ergebnisse können erheblich abweichen."
            : "Forecasts presented are based on market analyses and internal calculations. These statements are subject to risks and uncertainties; actual results may differ significantly."}
        </p>

        <p className="mb-5">
          <strong>{t.risk}</strong>
          <br />
          {language === "de"
            ? "Kryptowährungen und Utility-Token (WFT) unterliegen hoher Volatilität. WellFit garantiert keine Gewinne oder Werterhalt. Der Erwerb ist spekulativ und kann zum Totalverlust führen."
            : "Cryptocurrencies and utility tokens (WFT) are subject to high volatility. WellFit does not guarantee profits or value preservation. Acquisition is speculative and may result in total loss."}
        </p>

        <p>
          <strong>{t.mica}</strong>
          <br />
          {language === "de"
            ? "Das Projekt unterliegt der MiCA-Regulierung der EU. Änderungen im regulatorischen Umfeld können Einfluss auf die Roadmap haben."
            : "The project is subject to EU MiCA regulation. Changes in the regulatory environment may affect the roadmap."}
        </p>
      </section>

      {/* FOOTER */}
      <section className="border-t border-white/10 pt-6 text-sm text-white/70">
        © 2026 WellFit Global Operations. {t.rights}
      </section>
    </LegalPageLayout>
  );
}