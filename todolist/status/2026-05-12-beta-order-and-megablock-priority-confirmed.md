# 2026-05-12 - Beta-Reihenfolge und Megablock-Prioritaet bestaetigt

Status: aktiv / verbindliche Arbeitsreihenfolge

## Grundsatz

WellFit wird weiter blockweise aufgebaut. Die grossen Web-, Game-, Backend-, Economy-, Missionen-, Shop-, Reward-, Projection- und Server-Glue-Megabloecke werden zuerst fertiggestellt und getestet.

Erst danach kommen KI-Buddy-Endintegration, sichtbarer Buddy als Begleiter und sehr viel spaeter Blockchain-/NFT-Themen.

## Verbindliche Reihenfolge

1. Web-App, Missionen, Punkte, Reward, Spend, Shop, Dashboard, Tages-/Wochenmissionen, Abenteuer, Challenge, Wettkaempfe und interne Beta-Funktionen fertigstellen.
2. Interne Punkteabrechnung, Ledger, Audit, Projection, Server-Preview, Server-Completion, Spend-/Sink-Pfade und Firestore-Sicherheitslogik fertigstellen.
3. Alle sichtbaren Beta-Flows wie Mission auswaehlen, Mission starten, Mission abschliessen, Punkte anzeigen, Buddy-Futter, Shop-Preview und Reward-Score stabil machen.
4. Kleinere Hintergrundsachen und offene TODOs konsolidiert abarbeiten.
5. KI-Anbindungen fuer Missionen, Guide-Logik und interne Unterstuetzung vorbereiten.
6. KI-Buddy funktional anbinden.
7. Sichtbaren Buddy als letzten Produkt-/Companion-Schritt integrieren, inklusive spaeterer Bewegung durch Website/App und optional Realumgebung/AR.
8. Erst nach stabiler Testphase mit groesserer Nutzergruppe weitere externe Economy-/Blockchain-Themen bewerten.
9. NFTs, echte Token, Wallets, Auszahlungen, Trading, Staking, Presale oder Blockchain-Transfers bleiben fuer jetzt gestrichen bzw. weit nach Beta verschoben.

## Beta-Test-Prinzip

Vor Blockchain-/NFT-/Wallet-Themen muss zuerst das Spiel selbst mit echten Nutzern getestet werden.

Ziel vor spaeteren Economy-Erweiterungen:

- stabile Missionen
- stabile Punkteanzeige
- stabile interne Abrechnung
- stabile Server-Completion
- stabile Spend-/Sink-Preview
- stabile Buddy-Grundlogik
- stabile UI
- Bugs finden und beheben
- groessere Beta-Testphase, perspektivisch mit etwa 1000 Nutzern

## Aktuelle Arbeitsweise bleibt gueltig

Nach jedem Megablock:

```powershell
cd C:\wellfit\WellFit-now
git pull
npm run agent:code-inventory
npm run agent:quality-gate
npm run build
```

Bei sichtbaren UI-Aenderungen zusaetzlich Live-Test auf `wellfit-now.io`.

## Nicht tun

- Keine echten Token aktivieren.
- Keine NFTs aktivieren.
- Keine Wallet-Funktion aktivieren.
- Keine Auszahlungen aktivieren.
- Keine echten Kaeufe aktivieren.
- Keine Blockchain-Transfers aktivieren.
- Keine harte Firestore-Sperre, solange MVP-Bruecken noch fuer UI-Flows gebraucht werden.
- Keine Unity-/AR-Dateien in diesem Hauptchat bearbeiten.

## Naechster Arbeitsmodus

Vor weiterem groesseren Weiterbau zuerst TODO-/Roadmap-Liste analysieren:

- `todolist/TODO_INDEX.md`
- `todolist/MASTER_OPEN_DONE_LIST.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `todolist/PROJECT_STRUCTURE.md`
- `docs/architecture/WEB_BETA_ROADMAP_NO_BUDDY_AR.md`
- `docs/architecture/ECONOMY_SERVER_COMPLETION_AND_FIRESTORE_HARDENING.md`
- `docs/architecture/FIRESTORE_ECONOMY_RULES_HARDENING_TEST_PLAN.md`

Danach die naechsten Megabloecke in derselben sauberen Reihenfolge weiterfuehren.
