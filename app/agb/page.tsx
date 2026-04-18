"use client";

import LegalPageLayout from "@/app/components/LegalPageLayout";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

export default function AgbPage() {
  const { language } = useLegalLanguage();

  const t =
    language === "de"
      ? {
          title: "Allgemeine Geschäftsbedingungen",
          s1: "1. Geltungsbereich und Vertragsgegenstand",
          s2: "2. Nutzungsvoraussetzungen und Registrierung",
          s3: "3. Das WellFit-Ökosystem (Move-Learn-Earn)",
          s4: "4. WFT-Punkte, Token und Digitale Assets (NFTs)",
          s5: "5. DePIN-Protokoll (Externe Rechenleistung)",
          s6: "6. Gebühren und Tokenomics",
          s7: "7. Haftungsausschluss und Gesundheitshinweis",
          s8: "8. Schlussbestimmungen",
          rights: "Alle Rechte vorbehalten.",
        }
      : {
          title: "General Terms and Conditions",
          s1: "1. Scope and Subject Matter of the Contract",
          s2: "2. Requirements for Use and Registration",
          s3: "3. The WellFit Ecosystem (Move-Learn-Earn)",
          s4: "4. WFT Points, Tokens and Digital Assets (NFTs)",
          s5: "5. DePIN Protocol (External Computing Power)",
          s6: "6. Fees and Tokenomics",
          s7: "7. Disclaimer and Health Notice",
          s8: "8. Final Provisions",
          rights: "All rights reserved.",
        };

  return (
    <LegalPageLayout title={t.title}>
      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s1}
        </h2>

        <p className="mb-5">
          {language === "de"
            ? "Diese AGB regeln die Nutzung der WellFit-App, der Webseite sowie die Teilnahme am „Move-Learn-Earn“-Ökosystem."
            : "These terms govern the use of the WellFit app, the website and participation in the “Move-Learn-Earn” ecosystem."}
        </p>

        <p className="mb-5">
          {language === "de"
            ? "WellFit bietet eine Plattform zur Motivation für physische Aktivität und Wissensvermittlung, unterstützt durch digitale Belohnungen (WFT-Punkte, zukünftig WFT-Token) und dynamische Avatare (NFTs)."
            : "WellFit provides a platform that motivates physical activity and knowledge-based interaction, supported by digital rewards (WFT points, later WFT tokens) and dynamic avatars (NFTs)."}
        </p>

        <p>
          {language === "de"
            ? "Vertragspartner ist WellFit Global Operations, Turnerstrasse 18, 2345 Brunn am Gebirge, Österreich."
            : "The contractual partner is WellFit Global Operations, Turnerstrasse 18, 2345 Brunn am Gebirge, Austria."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s2}
        </h2>

        <p className="mb-5">
          {language === "de"
            ? "Die Registrierung erfolgt über zkLogin, zum Beispiel Google oder Apple, wodurch eine nahtlose Verbindung zur Blockchain hergestellt werden kann."
            : "Registration takes place via zkLogin, for example through Google or Apple, enabling a seamless connection to the blockchain."}
        </p>

        <p>
          {language === "de"
            ? "Nutzer sind verpflichtet, korrekte Angaben zu machen. Bei Minderjährigen ist die Zustimmung der Erziehungsberechtigten erforderlich."
            : "Users are required to provide accurate information. For minors, consent from legal guardians is required."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s3}
        </h2>

        <p className="mb-5">
          <strong>{language === "de" ? "Move & Validierung:" : "Move & validation:"}</strong>
          <br />
          {language === "de"
            ? "Physische Leistungen werden mittels Edge AI auf dem Endgerät erfasst. Die finale Verifizierung sowie die Zuteilung von Belohnungen erfolgen über die Server-Infrastruktur. Jegliche Form von Manipulation kann zum sofortigen Ausschluss führen."
            : "Physical performance is captured through edge AI on the end device. Final verification and reward allocation take place via server infrastructure. Any form of manipulation may lead to immediate exclusion."}
        </p>

        <p className="mb-5">
          <strong>{language === "de" ? "Learn:" : "Learn:"}</strong>
          <br />
          {language === "de"
            ? "Kognitive Leistungen werden durch Quiz, Lernaufgaben und weitere Wissensformate erbracht und können Voraussetzung für bestimmte Belohnungsstufen sein."
            : "Cognitive achievements are provided through quizzes, learning tasks and other knowledge-based formats and may be required for certain reward levels."}
        </p>

        <p>
          <strong>{language === "de" ? "Earn & Zero-Fraud:" : "Earn & zero fraud:"}</strong>
          <br />
          {language === "de"
            ? "Nutzer können WFT-Punkte, zukünftig Token, und digitale Gegenstände verdienen, die einen Nutzwert innerhalb des Partnernetzwerks haben. Wirtschaftliche Transaktionen werden serverseitig autorisiert, um das Ökosystem zu schützen."
            : "Users can earn WFT points, later tokens, and digital items that have utility within the partner network. Economic transactions are authorized server-side to protect the ecosystem."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s4}
        </h2>

        <p className="mb-5">
          <strong>
            {language === "de"
              ? "Web2 to Web3 Transition:"
              : "Web2 to Web3 transition:"}
          </strong>
          <br />
          {language === "de"
            ? "Aktuell sammelst du intern WFT-Punkte. Die Blockchain-Integration und Tokenisierung ist in Vorbereitung."
            : "At present, you collect internal WFT points. Blockchain integration and tokenization are in preparation."}
        </p>

        <p className="mb-5">
          <strong>
            {language === "de"
              ? "Keine Anlageberatung:"
              : "No investment advice:"}
          </strong>
          <br />
          {language === "de"
            ? "Der zukünftige WFT-Token ist als Utility-Token konzipiert und stellt keine Aktie oder klassische Finanzanlage dar."
            : "The future WFT token is designed as a utility token and does not constitute a share or traditional financial investment."}
        </p>

        <p className="mb-5">
          <strong>
            {language === "de"
              ? "Marktschwankungen:"
              : "Market fluctuations:"}
          </strong>
          <br />
          {language === "de"
            ? "WellFit garantiert keinen Werterhalt oder eine Wertsteigerung der Token."
            : "WellFit does not guarantee capital preservation or appreciation of token value."}
        </p>

        <p>
          <strong>
            {language === "de"
              ? "Dynamische NFTs:"
              : "Dynamic NFTs:"}
          </strong>
          <br />
          {language === "de"
            ? "Avatare sind dynamische digitale Objekte, deren Status sich durch Aktivität oder Inaktivität verändern kann."
            : "Avatars are dynamic digital objects whose status can change through activity or inactivity."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s5}
        </h2>

        <p className="mb-5">
          {language === "de"
            ? "Nutzer können optional an einem DePIN-Modell teilnehmen. Um Richtlinien mobiler Plattformen einzuhalten, findet keine rechenintensive Verarbeitung innerhalb der regulären mobilen WellFit-App statt."
            : "Users may optionally participate in a DePIN model. To comply with mobile platform guidelines, no compute-intensive processing takes place inside the regular WellFit mobile app."}
        </p>

        <p className="mb-5">
          {language === "de"
            ? "Die Teilnahme kann den Download einer separaten, eigenständigen WellFit Node App erfordern. Die mobile App kann dabei als Steuerungs- oder Anzeigeoberfläche dienen."
            : "Participation may require downloading a separate standalone WellFit Node App. The mobile app may then serve as a control or display interface."}
        </p>

        <p>
          {language === "de"
            ? "WellFit garantiert, dass hierbei kein Zugriff auf persönliche Daten wie Fotos oder Kontakte erfolgt."
            : "WellFit guarantees that no access to personal data such as photos or contacts takes place in this context."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s6}
        </h2>

        <p className="mb-5">
          <strong>
            {language === "de"
              ? "System-Gebühren:"
              : "System fees:"}
          </strong>
          <br />
          {language === "de"
            ? "Auf bestimmte Transaktionen, zum Beispiel PvP-Arena oder Marktplatz, können variable Gebühren erhoben werden, die der Stabilisierung des Ökosystems dienen."
            : "Variable fees may be charged on certain transactions, such as PvP arena or marketplace activity, in order to stabilize the ecosystem."}
        </p>

        <p>
          <strong>
            {language === "de"
              ? "Abonnements:"
              : "Subscriptions:"}
          </strong>
          <br />
          {language === "de"
            ? "Für Premium-Features wie WellFit+ können monatliche Abo-Gebühren anfallen."
            : "Monthly subscription fees may apply for premium features such as WellFit+."}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s7}
        </h2>

        <p className="mb-5">
          <strong>
            {language === "de"
              ? "Physische Eignung:"
              : "Physical suitability:"}
          </strong>
          <br />
          {language === "de"
            ? "Die Nutzung erfolgt auf eigene Gefahr. Nutzer sollten vor Beginn intensiver Trainingsprogramme ärztlichen Rat einholen."
            : "Use is at your own risk. Users should seek medical advice before starting intensive training programs."}
        </p>

        <p>
          <strong>
            {language === "de"
              ? "Technische Verfügbarkeit:"
              : "Technical availability:"}
          </strong>
          <br />
          {language === "de"
            ? "Da Teile des Systems auf Cloud-, API- oder Blockchain-Technologie basieren, kann für die ständige Verfügbarkeit des Netzwerks keine Haftung übernommen werden."
            : "As parts of the system rely on cloud, API or blockchain technology, no liability is assumed for uninterrupted network availability."}
        </p>
      </section>

      <section className="mb-6">
        <h2 className="mb-5 text-[2.05rem] font-semibold text-cyan-300">
          {t.s8}
        </h2>

        <p className="mb-5">
          {language === "de"
            ? "Es gilt österreichisches Recht."
            : "Austrian law shall apply."}
        </p>

        <p>
          {language === "de"
            ? "Änderungen dieser AGB werden dem Nutzer rechtzeitig mitgeteilt. Die fortgesetzte Nutzung des Systems nach einer Änderung kann als Zustimmung gewertet werden."
            : "Changes to these terms will be communicated to the user in due time. Continued use of the system after such changes may be deemed acceptance."}
        </p>
      </section>

      <section className="border-t border-white/10 pt-6 text-sm text-white/70">
        © 2026 WellFit Global Operations. {t.rights}
      </section>
    </LegalPageLayout>
  );
}