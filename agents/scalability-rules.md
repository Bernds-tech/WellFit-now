# WellFit Scalability Rules fuer Agenten

## Ziel

WellFit muss mit mehr Nutzern, mehr Missionen, mehr Buddy-Funktionen, mehr Mobile-Web- und spaeter Native-Features sowie mehr Daten wachsen koennen.

## Architekturregeln

- Bestehende Module erweitern, keine Parallelmodule ohne Decision-Log.
- Gemeinsame Komponenten statt kopierter UI-Logik nutzen.
- API-, Economy-, Buddy-, Mission- und Mobile-Logik klar trennen.
- Produktkritische Entscheidungen serverseitig oder ueber sichere APIs treffen.
- Grosse Dateien nicht weiter aufblaehen, wenn sinnvolle Extraktion moeglich ist.
- Neue Features immer in `project-register/features.json` dokumentieren.
- Neue APIs immer in `project-register/apis.json` dokumentieren.
- Neue oder geaenderte Routen immer in `project-register/routes.json` dokumentieren.

## Firebase-/Datenbankregeln

- Keine unkontrollierten globalen Reads ueber alle Userdaten.
- Listen paginieren oder begrenzen.
- Leaderboards aggregiert oder scoped planen.
- Punkte als Ledger-/Eventlogik fuehren, nicht nur als ueberschreibbare Zahl.
- Mission Completion und Reward-Vergabe nicht nur im Client berechnen.
- Index- und Query-Kosten mitdenken.

## Produktbereiche sauber trennen

- Dashboard = Uebersicht, Fortschritt, persoenliche Aktionen
- Missionen = Aufgaben, Evidence, Completion-Vorstufe
- Buddy = emotionale Bindung, Guide, Zustand, Reaktion
- Punkte-Shop = interne Punkte-Sinks, keine echten Kaeufe im MVP
- Marktplatz = aktuell vorsichtig/backlognah, keine Token-/NFT-Aktivierung
- Mobile-Web = App-nahe Nutzung, Touch, Performance, kleine Bundles
- Economy-APIs = Preview/Guardrails, spaeter serverseitige Autoritaet

## Skalierungscheck vor Abschluss

- Wird bestehende Logik wiederverwendet?
- Gibt es neue Abhaengigkeiten?
- Sind Routen/APIs/Features dokumentiert?
- Werden Daten effizient geladen?
- Gibt es Sicherheits- oder Kostenrisiken?
- Wurde ein neues Modul statt eines Parallelmoduls gebaut?
