# Challenges – Server Authority

Stand: 2026-07-23
Status: Implementiert, Build- und Emulatorprüfung vor Merge offen

## Umgesetzt

- kanonischer Katalog mit sechs Challenges;
- Admin-only Katalogabgleich;
- deterministischer Attempt pro Nutzer und Challenge;
- deterministische Evidence-Revisionen;
- Wiederverwendung der bestehenden Admin Evidence Queue;
- Dedicated Completion Callable mit WFXP-Ledger-Idempotenz;
- serverseitig abgeleiteter Challenge-Fortschritt;
- Challenge-Seite auf Firebase-Callables umgestellt;
- lokaler Punkte-/XP-/History-/Completion-Flag-Pfad entfernt;
- alter Dry-Run-API-Bridge entfernt;
- Favoriten und Routenvorbereitung bleiben ausschließlich lokale, nichtwirtschaftliche UI-Daten;
- fokussierter Emulator-Test in die vollständige Beta-1-Suite aufgenommen.

## Sicherheitsgrenzen

- kein Abschluss ohne Admin-freigegebene Evidence;
- keine zweite WFXP-Buchung für dieselbe Challenge und denselben Nutzer;
- keine Child Profiles im ersten Katalog;
- keine Rohmedien vorgeschrieben;
- keine direkten Client-Schreibvorgänge auf Wallet, Ledger, Completion oder `users`-Economy-Felder;
- keine Einsätze, Wetten oder Gewinnpools;
- WFXP sind interne Punkte ohne Geldwert;
- keine Token-, NFT-, Staking-, Zahlungs-, Blockchain-Transfer- oder Cashout-Funktion;
- kein Firebase-Deployment und keine Produktionsdatenänderung.

## Offene Gate-Prüfung

- Repository Product Boundary;
- Next.js/TypeScript Production Build;
- Functions Syntax und Startup;
- statische Firestore-Regelprüfung;
- vollständige Beta-1 Firestore-/Callable-Emulatorsuite;
- fokussierter Challenge-Emulatortest.

## Nächster Schritt nach grünem Merge

Den Abenteuer-Bereich oder die Profil-/Registrierungsbrücke als nächsten aktiven Economy-Pfad einzeln migrieren. Erst danach dürfen weitere Felder der allgemeinen `users/{userId}`-Kompatibilitätsbrücke geschlossen werden.
