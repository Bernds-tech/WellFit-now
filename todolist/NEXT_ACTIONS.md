# NEXT ACTIONS - WELLFIT BETA

## Ziel
Diese Datei steuert die naechsten Schritte bis zur ersten Beta-Version.

## Arbeitsregel
Die KI soll die Aufgaben von oben nach unten bearbeiten, sofern keine neue hoehere Prioritaet von Bernd kommt.

## Fuehrende Quellen
Vor Arbeit an dieser Datei immer lesen:
- `todolist/MASTER_PROMPT_FOR_AI.md`
- `todolist/TODO_INDEX.md`
- `todolist/TODO_CONSOLIDATION.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`
- `todolist/NEXT_CHAT_HANDOFF_PROMPT.md`
- `todolist/AUTONOMOUS_ITERATION_MODE.md`
- `docs/architecture/WELLFIT_ALPHA_SCOPE_CUT.md`

## Aktueller Produktfokus aus alter Roadmap J

Status aus `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT` wurde uebernommen:

- [x] Stufe 1 Mission Security / RewardPreview / Anti-Cheat Grundlage fachlich, emulatorseitig und produktionsseitig abgeschlossen.
- [~] Aktiver naechster Produktblock: KI-Buddy / echter AR-Begleiter / Unity AR Foundation.
- [>] Serverseitige Mission Completion / interne Rewards bleiben vorbereitet, werden aber nach KI-Buddy/AR weitergefuehrt.
- [~] Handy / AR / Avatar / Buddy bleibt vor Desktop-Marktplatz, Leaderboard, Shop und weiteren Produktmodulen priorisiert.
- [~] Browser/WebGL bleibt Demo und Fallback.
- [~] Unity AR Foundation bleibt verbindlicher Hauptpfad fuer echten Buddy-AR.
- [~] Buddy-KI, Missionsempfehlungen, Raetselgenerierung und Reward-Bewertung bleiben ausserhalb von Unity in Backend/App-Logik.
- [!] Unity rendert und steuert AR, aber finale Rewards, Mission Completion und Anti-Cheat bleiben serverseitig.
- [!] Mobile bleibt App-Store-konform: keine Token-/NFT-/Trading-/Presale-Funktion in Mobile.
- [>] Token-/NFT-/Ownership-Funktionen bleiben spaeter Web-/PC-Dashboard.
- [~] WellFit muss zuerst als internes Punkte-, XP-, Reward- und Economy-System funktionieren.
- [>] Blockchain, echte NFTs und WFT werden erst nach stabiler Alpha-/Beta-/Testphase ergaenzt.

## Prio 0 - TODO-/Agent-Gedaechtnis stabilisieren

- [~] Bestehenden `todolist/`-Ordner konsolidieren.
- [x] `todolist/TODO_INDEX.md` als zentralen Index mit Querverweisen angelegt.
- [x] `todolist/TODO_CONSOLIDATION.md` als Konsolidierungsdatei angelegt.
- [~] Gefundene Alt-TODOs in `TODO_INDEX.md` referenzieren.
- [ ] Vollstaendigen lokalen/Codex-Scan aller TODO-Dateien ausfuehren.
- [ ] Inhalte von `todolist/README.md` pruefen und relevante Punkte uebernehmen.
- [ ] Inhalte von `todolist/CHAT_START_PROMPT.md` pruefen und relevante Punkte uebernehmen.
- [ ] Jede wichtige TODO-Datei auf KI-Fortsetzungs-Prompt pruefen.
- [ ] Fehlende KI-Fortsetzungs-Prompts in Alt-TODOs ergaenzen.
- [ ] Doppelte TODOs als `duplikat` markieren, aber nicht loeschen.
- [ ] Veraltete TODOs als `veraltet` markieren, aber nicht loeschen.

## Prio 1 - KI-Buddy / Unity AR Foundation

Quelle: `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`, `todolist/H*`, `todolist/K_AR-BUDDY_COMPANION_UND_AVATAR-GRUNDLOGIK.md`

- [ ] `/mobile/ar` am Handy erneut testen: Kamera startet, Umgebung sichtbar, Avatar sichtbar, Buttons scrollbar.
- [ ] `/mobile/ar` pruefen: Provider-Anzeige, Text, Optionen, Fallback und Scrollbarkeit in aktiver/inaktiver Kamera.
- [ ] Unity-Projekt lokal erzeugen.
- [ ] Erste Android-ARCore-Build-Kette testen.
- [ ] Buddy platzieren, bewegen, springen und zum Nutzer zurueckrufen als echten Unity-AR-Pfad weiterfuehren.
- [ ] WebGL-Buddy als Demo/Fallback klar kennzeichnen.

## Prio 2 - KI-Buddy als Guide / Dialog / Missionsempfehler

Quelle: `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`, `docs/architecture/BUDDY_KI_INTEGRATION.md`, `docs/architecture/BUDDY_KI_MODEL_PROVIDER_RUNBOOK.md`

- [x] `app/api/buddy-ki/route.ts` vorhanden laut Roadmap J.
- [x] Rules-Fallback fuer Buddy-KI vorhanden laut Roadmap J.
- [x] Optionaler serverseitiger OpenAI-Modellprovider vorbereitet laut Roadmap J.
- [ ] Server-Env fuer echten Modelltest setzen, falls gewuenscht.
- [ ] Buddy-KI-Guide Datenmodell in App/Backend weiter ausbauen.
- [ ] KI-Buddy darf Vorschlaege machen, aber keine Rewards, Punkte, Token oder Mission-Completion autorisieren.

## Prio 3 - Serverseitige Mission Completion / interne Rewards

Quelle: `todolist/F - FIREBASE  - REALTIME - MISSIONEN`, `todolist/G - REWARD SYSTEM - SYSTEM HEALTH - NEXT-GEN MECHANICS`, `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`, `docs/architecture/MISSION_REWARD_CONTEXT_ENGINE.md`, `todolist/DATABASE_PLAN.md`

- [ ] `validateMissionCompletionWithItem` produktionsreif vorbereiten.
- [ ] `grantItemOrCapability` produktionsreif vorbereiten.
- [ ] `missionRewardEvents` als echte Audit-Events schreiben.
- [ ] Serverseitiges Punkte-Ledger als Pflichtarchitektur vorbereiten.
- [ ] Server-Transaktionen fuer interne XP/Punkte/Streaks vorbereiten.
- [ ] Punkte-Ausgaben, Sinks, Gebuehren, Jackpot und Burn-Aequivalente intern simulieren.
- [ ] 25-Mrd.-Supply-/Reserve-/Emission-Logik als interne Simulation vorbereiten.
- [ ] UserDailyCap gegen Nutzerhistorie pruefen.
- [ ] MissionTypeCap gegen Missionstyp und Kontext pruefen.
- [ ] Completion nur bei ausreichender Evidence erlauben.
- [ ] Completion bei hohem Pattern-/Cooldown-/Evidence-Risiko auf Manual Review setzen.
- [ ] Rejected-/Manual-Review-Pfade sauber auditieren.
- [ ] Firestore Rules fuer Nutzerpunkte/XP weiter haerten.
- [ ] Tagesmissionen schrittweise von MVP-Client-Reward auf Server-Preview/Server-Completion umstellen.

## Prio 4 - Website / Dashboard / Navigation / Beta-Demo

Quelle: `todolist/I - BUSINESS - WEBSITE - PARTNER - LEGAL`, `PROJECT_STRUCTURE.md`

- [ ] Startseite analysieren und verbessern.
- [ ] Dashboard analysieren und stabilisieren.
- [ ] Navigation und Seitenstruktur pruefen.
- [ ] Nutzerprofil und Avatar-Grundlage planen.
- [ ] Demo-Wallet klar als Mockup kennzeichnen.
- [ ] Mobile Ansicht pruefen.
- [ ] Beta-Akzeptanzkriterien definieren.

## Prio 5 - Datenbank / Backend / Auth

Quelle: `todolist/DATABASE_PLAN.md`, `todolist/F - FIREBASE  - REALTIME - MISSIONEN`

- [ ] Datenbankentscheidung vorbereiten: Firebase/Firestore, Supabase/PostgreSQL oder eigener PostgreSQL-Server.
- [ ] Nutzer-, Missions-, Progress-, Reward- und Audit-Datenmodell mit vorhandenen Firebase-Dateien abgleichen.
- [ ] Health-/Kinder-/Standortdaten besonders schuetzen.
- [ ] Keine clientseitige Autoritaet fuer Punkte, XP, Rewards, Mission Completion, Leaderboards oder Anti-Cheat.

## Dauerhafte Hinweise aus alter Roadmap J

- [!] Bei `npm install` kann ENOTEMPTY in `node_modules` auftreten; wenn Build danach erfolgreich ist, ist es nicht zwingend blockierend.
- [!] Bei wiederholten Fehlern `node_modules` bereinigen und neu installieren.
- [!] Firebase CLI: Nicht eingeloggt ist fuer lokale Demo-Emulator-Tests nicht immer kritisch.
- [!] Firebase CLI: Java < 21 wird ab firebase-tools@15 nicht mehr unterstuetzt; spaeter auf Java 21 wechseln.
- [!] Nur eine Emulator-Instanz parallel starten, sonst sind Ports 4000/8080/9099/5001 belegt.
- [!] Nur eine PM2-Instanz `wellfit-now` starten.
- [!] Nicht `next start` starten, solange `next build` noch laeuft oder `.next` unvollstaendig ist.
- [!] Mobile-App darf keine App-Store-kritischen Token-/NFT-/Trading-Funktionen enthalten.
- [!] Clientseitige Tagesmissions-Rewards sind MVP/UI-Logik, nicht langfristige Autoritaet.
- [!] WellFit bleibt bis nach stabiler Beta/Testphase internes Punkte-/XP-System; Blockchain, WFT und NFTs kommen danach als separate Schicht.

## KI-Fortsetzungs-Prompt
Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, danach diese Datei, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md` und `todolist/TODO_CONSOLIDATION.md`. Waehle die naechste offene Aufgabe aus, setze sie pragmatisch um und dokumentiere das Ergebnis. Bis zur Beta darf direkt auf `main` gearbeitet werden. Halte Aenderungen klein und modular. TODO-Dateien nicht loeschen, sondern erweitern oder markieren.

## Hinweise von Bernd
- Skalierbarkeit ist wichtig.
- Alles soll in kleinere Dateien aufgeteilt werden.
- Die Datenbank darf nicht vergessen werden.
- TODO-Dateien sollen eigene Prompts enthalten, damit die KI weiterarbeiten kann.
- TODO-Dateien duerfen bearbeitet, aber nicht geloescht werden.
- Es soll dokumentiert werden, wo welche Datei und welcher Ordner liegt.
- Neue TODO-Listen muessen relevante Inhalte aus alten TODOs uebernehmen oder verlinken.
