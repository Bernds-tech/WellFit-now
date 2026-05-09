# WellFit – Web-Beta-Roadmap ohne Buddy AR / Unity

Stand: 2026-05-09
Status: Fuehrender Restpfad bis Web-Beta

## Entscheidung

Bernd bevorzugt den sauberen und stressaermeren Weg bis zur Web-Beta.

Planung ab jetzt:

```txt
Restpfad bis Web-Beta: 12–14 Mega-Bloecke
Buddy AR / Unity: nicht in dieser Web-Beta-Planung enthalten
Ziel: stabil, nachvollziehbar, testbar, App-Store-/Beta-sicher
```

## Harte Produktgrenzen bis Web-Beta

- Keine echten Token.
- Keine NFTs.
- Keine Wallet-Funktion.
- Keine Auszahlungen.
- Keine echten Kaeufe.
- Kein Trading, Staking, Presale, DAO oder spekulative Finanzmechanik.
- Interne Punkte bleiben Beta-Waehrung.
- Server-/Ledger-/Audit-Pfade vor Firestore-Rules-Haertung.
- Buddy AR / Unity bleibt separater Arbeitsbereich und wird in diesem Web-Beta-Pfad nicht eingeplant.

## Aktueller Ausgangspunkt

Bereits gebaut:

- Interne 25-Mrd.-Punkte-/Reserve-Logik.
- RewardPreview und SpendPreview.
- Dashboard nutzt Server-Preview/Completion-Vorstufen.
- Tagesmissionen nutzen Server-Completion-Vorstufe.
- ServerLedgerDrafts fuer spaetere Persistenz.
- Persistence-Status-API mit `draft_only` und Writes aus.
- Firestore Rules Stufe 1 markiert Safe-Profile-Felder und temporaere Economy-Brueckenfelder.
- Quality Gate und Build laufen stabil.

## Restpfad – 12 bis 14 saubere Mega-Bloecke

### Mega-Block 12 – Server-Ledger-Persistenz-Vorstufe konkretisieren

Ziel:
- Echte Persistenz weiterhin auslassen, aber Datenmodell und Serverfunktion final vorbereiten.

Umfang:
- Server-only Write-Adapter als deaktivierte Schicht vorbereiten.
- Draft-to-Persist-Mapping fuer `missionRewardPreviews`, `missionCompletionEvaluations`, `missionRewardEvents` definieren.
- Guardrail bleibt: `writeEnabled: false`.

Akzeptanz:
- APIs bauen weiter.
- Keine Client-Writes aktiviert.
- Keine Firestore Rules hart geaendert.

Tests:
- Lokal: Agent + Build.
- Live: nein.

### Mega-Block 13 – Auth-/User-Validierung fuer Economy APIs vorbereiten

Ziel:
- APIs duerfen spaeter nicht blind `userId` aus dem Body vertrauen.

Umfang:
- Auth-Guard-Interface / Beta-Auth-Guard vorbereiten.
- UserId-Quelle und Ownership-Konzept dokumentieren.
- Aktuelle Beta-Fallbacks behalten.

Akzeptanz:
- Keine API bricht.
- Klare Trennung: Beta-Fallback vs. spaetere echte Auth.

Tests:
- Lokal: Agent + Build.
- Live: nein, solange UI unveraendert bleibt.

### Mega-Block 14 – Dashboard- und Tagesmissionen von finalen User-Patches weiter entkoppeln

Ziel:
- Direkte Client-Schreibstellen fuer `points`, `xp`, `level`, `avatar` weiter reduzieren.

Umfang:
- `useDashboardActions` weiter auf Projection-/Completion-Summary ausrichten.
- Tagesmissionen als Completion-Antrag statt finaler Autoritaet behandeln.
- UI-Fallbacks beibehalten, damit Beta nicht bricht.

Akzeptanz:
- Mission Start und Tagesmission Abschluss funktionieren.
- Keine direkte finale Autoritaet mehr in UI-Kommunikation.

Tests:
- Lokal: Agent + Build.
- Live: ja, Dashboard und Tagesmissionen klicken.

### Mega-Block 15 – Punkte-Shop / Buddy-Futter als sichere interne Punkte-Sinks staerken

Ziel:
- Futter und Shop-Items sauber als interne Punkte-Sinks darstellen.

Umfang:
- Keine echten Kaeufe.
- Kein Wallet.
- SpendPreview/ServerDraft sichtbarer und sauberer strukturieren.
- Optional: Shop-UI mit sicheren Beta-Hinweisen verbessern.

Akzeptanz:
- Punkte-Shop bleibt App-Store-sicher.
- Buddy-Futter nutzt interne Punkte-Sink-Logik.

Tests:
- Lokal: Agent + Build.
- Live: ja, `/punkte-shop` und `/dashboard` pruefen.

### Mega-Block 16 – Firestore Emulator Tests fuer Economy Rules vorbereiten

Ziel:
- DENY/ALLOW-Faelle vor echter Rules-Haertung testbar machen.

Umfang:
- Testfaelle fuer `users.points`, `users.xp`, `users.level`, `users.avatar`.
- Testfaelle fuer `missionRewardEvents`, `missionRewardPreviews`, `missionCompletionEvaluations`.
- Testplan aus `FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md` in ausfuehrbare oder halb-ausfuehrbare Struktur bringen.

Akzeptanz:
- Tests/Runbook existieren.
- Noch keine harte produktive Sperre.

Tests:
- Lokal: Agent + Build, optional Emulator.
- Live: nein.

### Mega-Block 17 – Firestore Rules Haertung Stufe 2 vorsichtig aktivieren

Ziel:
- Client darf Economy-kritische Felder nicht mehr final autorisieren.

Vorbedingung:
- Block 12–16 erfolgreich.

Umfang:
- `points`, `xp`, `level`, kritische Avatar-Economy-Felder aus Client-Writes entfernen oder hart begrenzen.
- Tagesmissions-Collections weiter einschraenken.

Akzeptanz:
- Emulator-Tests PASS.
- Dashboard/Tagesmissionen brechen nicht.

Tests:
- Lokal: Agent + Build + Emulator/Rules-Test.
- Live: ja, Dashboard/Tagesmissionen Smoke-Test.

### Mega-Block 18 – Beta-UX und Token-/NFT-/Wallet-Abgrenzung final glaetten

Ziel:
- Jeder sichtbare Bereich kommuniziert sauber: interne Punkte, keine Auszahlung, keine Token.

Umfang:
- Dashboard.
- Punkte-Shop.
- Marktplatz.
- Missionen.
- Mobile-Web-Seiten.

Akzeptanz:
- Keine missverstaendliche Finanzsprache.
- Marktplatz wirkt nicht wie NFT-/Trading-Markt.

Tests:
- Lokal: Agent + Build.
- Live: ja, sichtbare Seiten pruefen.

### Mega-Block 19 – Mission History / Favoriten / Sidequests beta-sauber anbinden

Ziel:
- Missionen wirken fuer Beta-Nutzer runder.

Umfang:
- History/Favoriten/Sidequests pruefen und UI-Status verbessern.
- Keine neue parallele RewardEngine.
- RewardPreview/Completion-Hinweise konsistent halten.

Akzeptanz:
- Keine toten oder verwirrenden Mission-Seiten.
- Favoriten/History sind mindestens beta-verstaendlich.

Tests:
- Lokal: Agent + Build.
- Live: ja, Missionen-Seiten klicken.

### Mega-Block 20 – Mobile-Web-Beta ohne AR stabilisieren

Ziel:
- Mobile-Web-Seiten stabilisieren, ohne Unity/Buddy AR einzubeziehen.

Umfang:
- `/mobile`, `/mobile/missionen`, `/mobile/buddy`, `/mobile/bewegung`, `/mobile/einstellungen`.
- `/mobile/ar` nur als bestehender Web-Fallback/Platzhalter pruefen, nicht als Unity-Arbeit.

Akzeptanz:
- Keine offensichtlichen Layoutbrueche.
- Mobile-Web wirkt beta-testbar.

Tests:
- Lokal: Agent + Build.
- Live: ja, Handy-Test auf wellfit-now.io.

### Mega-Block 21 – Register/Login/Profile/Beta-Onboarding stabilisieren

Ziel:
- Nutzer koennen sauber starten und verstehen, was WellFit aktuell ist.

Umfang:
- Register-Seite pruefen.
- Profil-/Dashboard-Erstzustand pruefen.
- Beta-Hinweise verbessern.

Akzeptanz:
- Neuer Nutzer landet nachvollziehbar im Produkt.
- Keine Token-/Wallet-Sprache im Onboarding.

Tests:
- Lokal: Agent + Build.
- Live: ja, Registrierungs-/Login-Pfad pruefen.

### Mega-Block 22 – Legal / Datenschutz / App-Store-Safety Review

Ziel:
- Rechtliche und App-Store-nahe Texte beta-sicher machen.

Umfang:
- Datenschutz.
- AGB.
- Impressum.
- FAQ.
- Health/Standort/Kamera/Kinder-Hinweise.

Akzeptanz:
- Keine falschen Versprechen.
- Keine Finanz-/Token-/Auszahlungswirkung.
- Sensible Daten sauber erklaert.

Tests:
- Lokal: Agent + Build.
- Live: ja, Legal-Seiten pruefen.

### Mega-Block 23 – Beta Smoke-Test Matrix und Release-Kandidat

Ziel:
- Beta-Kandidat erstellen.

Umfang:
- Testmatrix fuer Hauptpfade.
- Live-Testliste.
- Bekannte Einschraenkungen.
- Was ist Beta, was ist Backlog.

Akzeptanz:
- Alle Hauptseiten erreichbar.
- Build/Quality Gate PASS.
- Live-Smoke-Test bestanden.

Tests:
- Lokal: Agent + Build.
- Live: ja, komplette Smoke-Test-Runde.

### Mega-Block 24 – Beta-Puffer 1: Fehlerkorrekturen

Ziel:
- Fehler aus Live-/lokalen Tests beheben.

Umfang:
- UI-Fixes.
- kleine Logik-Fixes.
- kaputte Links/Routen.
- Text-/Layout-Korrekturen.

Akzeptanz:
- Keine neuen Grossfunktionen.
- Nur Stabilisierung.

Tests:
- Lokal: Agent + Build.
- Live: ja, betroffene Seiten.

### Mega-Block 25 – Beta-Puffer 2: Abschluss-Politur und Handoff

Ziel:
- Beta sauber abschliessen und naechste Phase vorbereiten.

Umfang:
- Projektgedaechtnis aktualisieren.
- Beta-Handoff schreiben.
- Backlog nach Beta ordnen.
- Buddy AR / Unity separat belassen.

Akzeptanz:
- Web-Beta-Stand ist dokumentiert.
- Restaufgaben sind klar.

Tests:
- Lokal: Agent + Build.
- Live: nur falls sichtbare Aenderungen.

## Zaehlung

Ab aktuellem Stand sind noch geplant:

```txt
12 bis 14 Mega-Bloecke
```

Kernbloecke:

```txt
12–23 = 12 Bloecke bis Beta-Kandidat
24–25 = 2 Puffer-/Politur-Bloecke
```

Damit bleibt der Pfad bewusst stressaermer.

## Nicht Teil dieses Plans

- Unity-Projekt.
- Native ARCore/ARKit.
- WellFitBuddyAR-Merge.
- Blockchain-Tokenisierung.
- NFT-/Wallet-/Trading-Funktionen.
- Echte Auszahlungen oder echte Kaeufe.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/CODEBASE_FEATURE_MAP.md`, `todolist/PROJECT_STRUCTURE.md`, `todolist/MASTER_OPEN_DONE_LIST.md`, `todolist/DONE_LOG.md` und diese Datei.

Arbeite die Web-Beta bewusst sauber und stressarm ab. Plane mit 12–14 Mega-Bloecken Restpfad. Buddy AR / Unity ist nicht Teil dieses Web-Beta-Pfads. Nach jedem Mega-Block klar sagen: lokaler Test ja/nein und Live-Test auf wellfit-now.io ja/nein. Keine echten Token, NFTs, Wallets, Auszahlungen oder echten Kaeufe aktivieren.
