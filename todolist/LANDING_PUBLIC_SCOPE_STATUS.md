# PUBLIC LANDING SCOPE STATUS

Stand: 2026-07-28

## Verbindlicher Arbeitsbereich

Aktuell werden ausschließlich die öffentliche Landingpage `/` und ihre öffentlichen Abschnitte bearbeitet:

- Header und Hero
- So funktioniert’s
- Erlebnisse
- Dein Buddy
- Für wen
- Sicherheit
- Über uns
- öffentlicher CTA und Footer
- öffentliche Visuals, Responsive Design, SEO und Performance

## Explizit nicht im Scope

- Login-/Registrierungslogik
- Dashboard und interne App-Seiten
- Firebase, Firestore und Functions
- Mission-, Reward-, WFXP- oder Buddy-KI-Autorität
- Nutzer-, Health-, Standort- oder Kinderdatenlogik
- Adminbereich und Agentensystem-Runtime
- Unity, AR und Mobile-App-Runtime
- Token, NFT, Wallet, Zahlung oder Blockchain

Vorhandene Links nach `/login` und `/register` bleiben erhalten. Deren interne Logik wird nicht verändert.

## Aktueller Umsetzungsschritt

- provisorischen Landing-CSS-Zoom entfernen
- echtes responsives Layout herstellen
- cineastische Hero-Welt integrieren
- vier eigenständige Feature-Visuals verwenden
- Besonderheiten, Bürgermeister-Roadmap, Tamagotchi-Pflege und Buddy-Sichtbarkeit deutlicher erklären
- alle öffentlichen Abschnitte visuell vereinheitlichen
- Staging-Screenshot nach Deployment prüfen

Statushinweis 2026-07-29: Die meisten Punkte dieses Umsetzungsschritts wurden bis PR #362 gemergt. Offen bleiben insbesondere die Entfernung des CSS-`zoom`, messbare Responsive-/Performance-/A11y-Evidence sowie `robots.txt`, Sitemap und weitere SEO-Abnahme.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, den aktuellen Runtime-Status und das Execution Board. Behandle diese Datei als begrenzten Public-Landing-Scope. Revalidiere offene Punkte gegen den aktuellen Live-Commit, wiederhole keine bereits gemergte Premiumphase und beruehre keine Auth-, Firebase-, Mission-, Economy-, Buddy-KI-, Agent-, Unity-, Token- oder Blockchain-Autoritaet.
