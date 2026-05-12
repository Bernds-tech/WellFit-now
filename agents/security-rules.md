# WellFit Security Rules fuer Agenten

## Grundsatz

Agenten duerfen entwickeln, pruefen und dokumentieren. Sie duerfen keine produktiven Daten, Secrets oder Live-Deployments autonom veraendern.

## Verbotene autonome Aktionen

Ohne ausdrueckliche Freigabe verboten:

- Production Deploy
- Secrets lesen, ausgeben, veraendern oder in Frontend-Dateien schreiben
- Firebase Admin Keys oder Provider Keys in Client-Code einbauen
- echte Token-/WFT-/NFT-/Wallet-/Trading-/Kauf-/Auszahlungsfunktionen aktivieren
- Punkte, XP, Rewards, Einsaetze oder Mission Completion clientseitig autorisieren
- Firestore Rules verschaerfen, ohne Guardrail-/Emulator-Testplan
- echte Nutzerdaten migrieren, loeschen oder massenhaft veraendern
- Todo-, Architektur-, Roadmap- oder Statusdateien loeschen

## Economy- und Reward-Sicherheit

- Client, Mobile-Web, Unity und Buddy-KI duerfen nur Events, Evidence oder Previews erzeugen.
- Backend/API/Serverlogik bleibt Autoritaet fuer Punkte, XP, Rewards und Mission Completion.
- Aktuell gilt: interne Punkte-/XP-/Reward-Preview vor Blockchain.
- Keine echte Tokenisierung vor stabilem Ledger, Abrechnung, Audit, Rules und rechtlicher Pruefung.

## Firebase/Firestore

- User duerfen nur eigene Daten lesen/schreiben, soweit Rules dies erlauben.
- Punkte-/XP-/Reward-Felder duerfen nicht direkt vom Client final geschrieben werden.
- Rules-Aenderungen muessen mit Testplan, Emulator oder Guardrail-Check vorbereitet werden.
- Admin-/Server-SDK muss ueber IAM/Serverumgebung geschuetzt bleiben.

## API-Routen

Jede API mit Economy-, Buddy-, Mission- oder User-Bezug muss pruefen:

- Auth-/User-Kontext
- Input-Validierung
- sichere Defaults
- keine finalen Client-Trust-Entscheidungen
- Logging/Preview-Status
- keine Secrets in Response

## Security Self Check

Vor Abschluss pruefen:

- Wurde eine Security-Regel verletzt?
- Wurde eine riskante Datei veraendert?
- Wurde eine API- oder Firebase-Regel ohne Testplan geaendert?
- Wurde eine MVP-Grenze in Richtung Token/NFT/WFT ueberschritten?
- Muss eine Entscheidung in `decisions.json` dokumentiert werden?
