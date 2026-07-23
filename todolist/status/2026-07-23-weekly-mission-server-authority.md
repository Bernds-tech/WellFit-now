# Wochenmissionen – Server Authority

Stand: 2026-07-23
Status: Implementiert, Build- und Emulatorprüfung vor Merge offen

## Umgesetzt

- kanonischer Katalog mit drei Hauptmissionen;
- Admin-only Katalogabgleich;
- serverseitige Europe/Vienna-/ISO-Wochengrenze;
- deterministischer Attempt pro Nutzer, Mission und Woche;
- deterministische Evidence-Revisionen;
- Wiederverwendung der bestehenden Admin Evidence Queue;
- Dedicated Completion Callable mit WFXP-Ledger-Idempotenz;
- serverseitig abgeleiteter Wochenfortschritt und 3/3-Ziel;
- Wochenmissionsseite auf Firebase-Callables umgestellt;
- lokaler Punkte-/XP-/History-/Reward-Flag-Pfad entfernt;
- alter Dry-Run-API-Bridge entfernt;
- Favoriten bleiben ausschließlich lokale, nichtwirtschaftliche UI-Präferenz;
- fokussierter Emulator-Test in die vollständige Beta-1-Suite aufgenommen.

## Sicherheitsgrenzen

- kein Abschluss ohne Admin-freigegebene Evidence;
- keine zweite WFXP-Buchung für dieselbe Mission und Wien-Woche;
- keine Child Profiles im ersten Katalog;
- keine Rohmedien vorgeschrieben;
- keine direkten Client-Schreibvorgänge auf Wallet, Ledger, Completion oder `users`-Economy-Felder;
- WFXP sind interne Punkte ohne Geldwert;
- keine Token-, NFT-, Staking-, Zahlungs-, Blockchain-Transfer- oder Cashout-Funktion;
- kein Firebase-Deployment und keine Produktionsdatenänderung.

## Offene Gate-Prüfung

- Repository Product Boundary;
- Next.js/TypeScript Production Build;
- Functions Syntax und Startup;
- statische Firestore-Regelprüfung;
- vollständige Beta-1 Firestore-/Callable-Emulatorsuite;
- fokussierter Wochenmissions-Emulatortest.

## Nächster Schritt nach grünem Merge

Aktive Aufrufer des alten `lib/missionCompletion.ts` inventarisieren und den nächsten sichtbaren Missionsbereich einzeln auf die bestehende Server-Authority migrieren, bevor weitere Felder der allgemeinen `users/{userId}`-Kompatibilitätsbrücke geschlossen werden.
