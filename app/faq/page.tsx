"use client";

import { useState } from "react";
import LegalPageLayout from "@/app/components/LegalPageLayout";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  title: string;
  items: FaqItem[];
};

function AccordionGroup({ category }: { category: FaqCategory }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mb-8">
      <h2 className="mb-4 border-b border-cyan-400/20 pb-2 text-2xl font-semibold text-cyan-300">
        {category.title}
      </h2>

      <div className="space-y-3">
        {category.items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`flex w-full items-center justify-between px-5 py-4 text-left text-lg font-medium transition ${
                  isOpen ? "bg-cyan-900/40 text-cyan-100" : "hover:bg-white/10"
                }`}
              >
                <span>{item.question}</span>
                <span className="text-2xl text-cyan-300">
                  {isOpen ? "⌃" : "⌄"}
                </span>
              </button>

              {isOpen && (
                <div className="bg-black/20 px-5 py-4 text-base leading-7 text-white/90">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function FaqPage() {
  const { language } = useLegalLanguage();

  const leftCategories: FaqCategory[] =
    language === "de"
      ? [
          {
            title: "01. Allgemeines & Vision",
            items: [
              {
                question: "Was ist WellFit?",
                answer:
                  "WellFit ist das weltweit erste „Move-Learn-Earn“-Ökosystem, das körperliche Bewegung, Bildung und digitale Belohnungen in einem interaktiven Abenteuer vereint.",
              },
              {
                question: "Was bedeutet „Move-Learn-Earn“?",
                answer:
                  "Es handelt sich um eine dreifache Wertschöpfung: Sie bewegen sich physisch, nehmen an kognitiven Wissens-Quests teil und erhalten dafür WFT-Token oder digitale Upgrades für Ihren Avatar.",
              },
              {
                question: "Wie unterscheidet sich WellFit von anderen Fitness-Apps?",
                answer:
                  "WellFit kombiniert Gamification, KI-Buddys, Bildung, soziale Interaktion, AR-Erlebnisse und eine digitale Ökonomie. Der Fokus liegt auf langfristiger Motivation statt auf kurzfristiger Nutzung.",
              },
              {
                question: "Kostet die App Geld?",
                answer:
                  "Die Basisversion ist als Freemium-Modell gedacht. Für zusätzliche Premium-Funktionen wie exklusive Inhalte, erweiterte KI-Analysen oder Spezial-Challenges ist ein Abo vorgesehen. ",
              },
              {
                question: "Auf welchen Geräten kann ich WellFit nutzen?",
                answer:
                  "WellFit ist für moderne iOS- und Android-Smartphones optimiert. Viele AR-Erlebnisse funktionieren direkt über die Smartphone-Kamera. Perspektivisch sind auch weitere Geräteklassen denkbar. ",
              },
            ],
          },
          {
            title: "02. Der KI-Buddy & Psychologie",
            items: [
              {
                question: "Was ist ein „Digitaler Zwilling“?",
                answer:
                  "Dein Avatar ist ein dynamischer digitaler Begleiter, der deinen echten Fortschritt widerspiegelt und sich durch Aktivität weiterentwickelt. Er dient als emotionaler Anker und Motivationsverstärker. ",
              },
              {
                question: "Was ist der „Proteus-Effekt“?",
                answer:
                  "Der Proteus-Effekt beschreibt ein psychologisches Phänomen, bei dem Nutzer ihr reales Verhalten an ihren Avatar anpassen. Ein fitter, stärkerer Avatar kann also Motivation und Selbstvertrauen steigern.",
              },
              {
                question: "Was ist die „Adoptions-Liste“?",
                answer:
                  "Wenn ein Buddy über längere Zeit vernachlässigt wird, kann er an Energie verlieren und inaktiv werden. Solche Mechaniken sollen emotionale Bindung und regelmäßige Nutzung fördern.",
              },
            ],
          },
          {
            title: "03. Familie, Soziales & Kinderschutz",
            items: [
              {
                question: "Was ist das „Generationen-Tandem“?",
                answer:
                  "Die Idee dahinter ist, dass verschiedene Altersgruppen – etwa Enkel und Großeltern – durch gemeinsame Aktivitäten verbunden werden. Aktivität eines Familienmitglieds kann positive Effekte im gemeinsamen WellFit-Erlebnis erzeugen.",
              },
              {
                question: "Wie hilft WellFit Kindern beim Schlafen?",
                answer:
                  "WellFit kann spielerische Routinen rund um Ruhe, Schlaf und Entspannung fördern, etwa über Buddy-Mechaniken, feste Abläufe oder familienbezogene Challenges.",
              },
              {
                question: "Gibt es Funktionen für soziale Vernetzung?",
                answer:
                  "Ja. WellFit ist stark auf soziale Motivation ausgelegt: Teams, Familien, Gruppen, Firmen oder lokale Communities können gemeinsam Ziele verfolgen und sich gegenseitig motivieren. ",
              },
            ],
          },
          {
            title: "04. Retail & Local Commerce",
            items: [
              {
                question: "Was hat ein Supermarkt oder lokaler Partner davon?",
                answer:
                  "Lokale Partner können Challenges, AR-Erlebnisse oder Belohnungen in ihre Standorte integrieren und dadurch Besucherfrequenz, Interaktion und Kundenbindung erhöhen. ",
              },
              {
                question: "Gibt es „Green-to-Earn“-Vorteile?",
                answer:
                  "Das Konzept lässt sich mit nachhaltigen Verhaltensweisen verbinden, etwa Bewegung zu Fuß oder per Fahrrad, um gesundes und umweltfreundliches Verhalten zusätzlich zu belohnen.",
              },
            ],
          },
        ]
      : [
          {
            title: "01. General & Vision",
            items: [
              {
                question: "What is WellFit?",
                answer:
                  "WellFit is a global Move-Learn-Earn ecosystem that combines physical activity, education and digital rewards in one interactive experience.",
              },
              {
                question: "What does “Move-Learn-Earn” mean?",
                answer:
                  "It means triple value creation: users move physically, take part in knowledge quests and receive WFT tokens or digital upgrades for their avatar.",
              },
              {
                question: "How is WellFit different from other fitness apps?",
                answer:
                  "WellFit combines gamification, AI buddies, education, social interaction, AR experiences and a digital economy. The focus is long-term motivation instead of short-term engagement.",
              },
              {
                question: "Does the app cost money?",
                answer:
                  "The core version is planned as freemium. Premium features such as exclusive content, advanced AI analysis or special challenges may require a subscription. ",
              },
              {
                question: "Which devices can I use WellFit on?",
                answer:
                  "WellFit is optimized for modern iOS and Android smartphones. Many AR experiences work directly through the phone camera. Additional device classes may follow later. ",
              },
            ],
          },
          {
            title: "02. AI Buddy & Psychology",
            items: [
              {
                question: "What is a digital twin?",
                answer:
                  "Your avatar is a dynamic digital companion that reflects your real-world progress and evolves through activity. It acts as an emotional anchor and motivational amplifier. ",
              },
              {
                question: "What is the Proteus effect?",
                answer:
                  "The Proteus effect describes a psychological phenomenon where users adapt their real behavior to their avatar. A stronger avatar can increase confidence and motivation.",
              },
              {
                question: "What is the adoption list?",
                answer:
                  "If a buddy is neglected for too long, it may lose energy and become inactive. Mechanics like this are designed to strengthen emotional attachment and regular use.",
              },
            ],
          },
          {
            title: "03. Family, Social & Child Protection",
            items: [
              {
                question: "What is the generation tandem?",
                answer:
                  "The idea is that different age groups, such as grandparents and grandchildren, are connected through shared activity. One family member’s activity can positively affect the shared WellFit experience.",
              },
              {
                question: "How can WellFit help children with sleep routines?",
                answer:
                  "WellFit can support playful routines around sleep, calmness and recovery through buddy mechanics, fixed rituals or family-centered challenges.",
              },
              {
                question: "Are there social networking features?",
                answer:
                  "Yes. WellFit is strongly designed around social motivation: teams, families, companies and communities can pursue shared goals and motivate each other. ",
              },
            ],
          },
          {
            title: "04. Retail & Local Commerce",
            items: [
              {
                question: "What is the benefit for supermarkets or local partners?",
                answer:
                  "Local partners can integrate challenges, AR experiences or rewards into their locations to increase foot traffic, interaction and customer loyalty. ",
              },
              {
                question: "Are there green-to-earn benefits?",
                answer:
                  "The concept can be linked to sustainable behavior, such as walking or cycling, so healthy and eco-friendly choices can also be rewarded.",
              },
            ],
          },
        ];

  const rightCategories: FaqCategory[] =
    language === "de"
      ? [
          {
            title: "05. B2B-Partner (Zoos, Museen, Schulen, Städte)",
            items: [
              {
                question: "Was ist „Silent Disco Learning“?",
                answer:
                  "Damit sind ortsbasierte, immersive Lernformate gemeint, bei denen Audio, Bewegung und Quiz-Interaktionen kombiniert werden, zum Beispiel in Museen oder Erlebnisorten.",
              },
              {
                question: "Muss ich teure Hardware installieren?",
                answer:
                  "Nein. Viele WellFit-Erlebnisse setzen auf bestehende Smartphones und Browser-/App-Technologie. Zusätzliche Hardware ist nur optional.",
              },
              {
                question: "Erhalte ich Daten über meine Besucher?",
                answer:
                  "Partner können konzeptionell auf aggregierte, anonyme Nutzungsdaten und Interaktionsmuster zugreifen, sofern dies datenschutzkonform umgesetzt wird.",
              },
            ],
          },
          {
            title: "06. AR-Erlebnisse & Immersion",
            items: [
              {
                question: "Welche AR-Erlebnisse gibt es?",
                answer:
                  "WellFit plant AR-Pfade, Schatzsuchen, standortbezogene Rätsel, Mini-Games, Stadt- und Naturmissionen sowie Fantasy- und Bildungsabenteuer. ",
              },
              {
                question: "Brauche ich eine spezielle AR-Brille?",
                answer:
                  "Nein. Die meisten AR-Inhalte sind für Smartphones gedacht. Perspektivisch kann das System auf weitere Endgeräte erweitert werden.",
              },
            ],
          },
          {
            title: "07. Technologie & Datenschutz",
            items: [
              {
                question: "Wie erkennt die App meine Bewegung?",
                answer:
                  "WellFit setzt auf Sensoren, Smartphone-Daten und KI-gestützte Bewegungserkennung. Geplant ist ein Hybrid aus lokaler Geräte-KI und Cloud-Systemen. ",
              },
              {
                question: "Warum nutzt WellFit Blockchain-Technologie?",
                answer:
                  "Die Blockchain dient als Grundlage für WFT-Token, NFTs, transparente Transaktionen, Wallet-Funktionen und digitale Besitzstrukturen innerhalb des Ökosystems. ",
              },
            ],
          },
          {
            title: "08. Wirtschaft & Tokenomics (WFT)",
            items: [
              {
                question: "Woher kommt der Wert des Tokens?",
                answer:
                  "Der Wert ergibt sich aus der Funktion innerhalb des Systems: Belohnungen, Käufe, NFTs, Marktplatz, Premium-Inhalte, Gebührenmechaniken und weitere Ökosystem-Nutzungen. ",
              },
              {
                question: "Was ist DePIN und wie funktioniert es?",
                answer:
                  "Im erweiterten Konzept ist vorgesehen, ungenutzte Rechenleistung nutzbar zu machen. Diese Idee ist Teil des langfristigen Systems, muss aber technisch und regulatorisch sauber umgesetzt werden.",
              },
              {
                question: "Wie kann ich verdiente WFT nutzen?",
                answer:
                  "WFT kann innerhalb des Systems für NFTs, Upgrades, Events, Marktplatz-Funktionen und weitere digitale Inhalte genutzt werden. Perspektivisch sind auch Wallet- und Transferfunktionen vorgesehen. ",
              },
            ],
          },
          {
            title: "09. Zukunft & Wachstum",
            items: [
              {
                question: "Ist WellFit auch für Schulen, Unternehmen oder Städte gedacht?",
                answer:
                  "Ja. Das Konzept ist ausdrücklich auf eine breite Zielgruppe und auf Partnerschaften mit Schulen, Unternehmen, Städten, Museen und weiteren Institutionen ausgerichtet. ",
              },
              {
                question: "Wie groß kann WellFit werden?",
                answer:
                  "In den Projektunterlagen wird ein sehr breites Skalierungspotenzial beschrieben, von einer starken Community bis hin zu Millionen Nutzern, getragen durch Gamification, Partnerschaften und ein modulares Plattformmodell. ",
              },
            ],
          },
        ]
      : [
          {
            title: "05. B2B Partners (Zoos, Museums, Schools, Cities)",
            items: [
              {
                question: "What is silent disco learning?",
                answer:
                  "It refers to immersive, location-based learning formats that combine audio, movement and quiz interactions, for example in museums or experiential spaces.",
              },
              {
                question: "Do I need expensive hardware?",
                answer:
                  "No. Many WellFit experiences rely on existing smartphones and browser/app technology. Extra hardware is optional only.",
              },
              {
                question: "Do partners receive visitor insights?",
                answer:
                  "Conceptually, partners can access aggregated anonymous usage patterns and interaction data, as long as everything is implemented in a privacy-compliant way.",
              },
            ],
          },
          {
            title: "06. AR Experiences & Immersion",
            items: [
              {
                question: "What kind of AR experiences are planned?",
                answer:
                  "WellFit includes AR paths, treasure hunts, location-based riddles, mini-games, city and nature missions, as well as fantasy and educational adventures. ",
              },
              {
                question: "Do I need special AR glasses?",
                answer:
                  "No. Most AR content is designed for smartphones. The system can later expand to additional device classes.",
              },
            ],
          },
          {
            title: "07. Technology & Privacy",
            items: [
              {
                question: "How does the app detect my movement?",
                answer:
                  "WellFit uses sensors, smartphone data and AI-supported motion recognition. The plan is a hybrid system combining local device AI and cloud infrastructure. ",
              },
              {
                question: "Why does WellFit use blockchain technology?",
                answer:
                  "Blockchain supports WFT tokens, NFTs, transparent transactions, wallet functions and digital ownership structures within the ecosystem. ",
              },
            ],
          },
          {
            title: "08. Economy & Tokenomics (WFT)",
            items: [
              {
                question: "Where does the token value come from?",
                answer:
                  "Its value comes from its utility within the system: rewards, purchases, NFTs, marketplace activity, premium content, fee mechanics and other ecosystem use cases. ",
              },
              {
                question: "What is DePIN and how does it work?",
                answer:
                  "In the extended concept, unused computing resources may become usable within the ecosystem. This is a long-term system idea and would need technically and regulatorily sound implementation.",
              },
              {
                question: "How can I use earned WFT?",
                answer:
                  "WFT can be used within the system for NFTs, upgrades, events, marketplace functions and other digital content. Wallet and transfer features are planned as well. ",
              },
            ],
          },
          {
            title: "09. Future & Growth",
            items: [
              {
                question: "Is WellFit also intended for schools, companies or cities?",
                answer:
                  "Yes. The concept is explicitly designed for a broad audience and for partnerships with schools, companies, cities, museums and other institutions. ",
              },
              {
                question: "How large can WellFit become?",
                answer:
                  "Project documents describe strong scaling potential, from a growing community to millions of users, driven by gamification, partnerships and a modular platform model. ",
              },
            ],
          },
        ];

  return (
    <LegalPageLayout
      title={language === "de" ? "Häufig gestellte Fragen (FAQ)" : "Frequently Asked Questions (FAQ)"}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          {leftCategories.map((category) => (
            <AccordionGroup key={category.title} category={category} />
          ))}
        </div>

        <div>
          {rightCategories.map((category) => (
            <AccordionGroup key={category.title} category={category} />
          ))}
        </div>
      </div>

      <section className="border-t border-white/10 pt-6 text-sm text-white/70">
        © 2026 WellFit Global Operations.{" "}
        {language === "de" ? "Alle Rechte vorbehalten." : "All rights reserved."}
      </section>
    </LegalPageLayout>
  );
}