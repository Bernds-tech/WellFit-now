# Buddy Actions – Server Authority

Stand: 2026-07-23
Status: umgesetzt, CI- und Emulatorprüfung vor Merge erforderlich

## Ziel

Die Web- und Mobile-Buddy-Oberflächen dürfen WFXP, Avatarwerte oder Buddy-Aktionshistorie nicht mehr direkt in `users/{userId}` schreiben. Kostenpflichtige und kostenlose Pflegeaktionen werden ausschließlich durch authentifizierte Firebase Callables autorisiert.

## Neuer Laufzeitpfad

```text
Buddy UI
→ getBuddyStateProjection
→ performBuddyCareAction oder bestehender Buddy-Futterpfad
→ userAvatars
→ xpWallets / xpLedgerEvents / ledgerEvents
→ auditEvents / adminActions
→ serverseitige Buddy-Projektion
```

## Umgesetzt

- `functions/lib/beta1BuddyActions.js`
  - serverseitige Zustandsprojektion aus `userAvatars` und WFXP-Wallet
  - atomare Aktionen `care`, `play`, `clean`, `call`, `search`
  - servereigene Preise und Cooldowns
  - Statusregeln für `active`, `tired`, `needsCare`, `messy`, `ranAway`
  - idempotente Request-IDs
  - WFXP-Saldo-, Ledger- und Audit-Transaktion in einem Commit
  - keine Token-, Blockchain-, Echtgeld- oder Cashout-Autorität
  - Guardian-, Permission- und Consent-Prüfung für Child Profiles
- `lib/beta1/clientBuddyActions.ts`
  - typisierte Callable-Clients
  - strikte Prüfung der Serverautorität
  - sichere Fehlertexte und Request-ID-Erzeugung
- `app/buddy/hooks/useBuddyState.ts`
  - direkte `setDoc(users/{userId})`-Schreibvorgänge entfernt
  - keine lokale Erfolgsprojektion für WFXP oder Avatarzustand
  - Füttern nutzt den bestehenden atomaren Shop-/Inventar-/Consume-Pfad
  - alle anderen Aktionen nutzen `performBuddyCareAction`
- Web- und Mobile-UI zeigen WFXP und Serverstatus ausdrücklich an.
- `buddyCareActions` bleibt für Clients vollständig durch Default-Deny gesperrt.
- `userAvatars` bleibt owner-/guardian-readable, aber client-write-denied.

## Emulator-Akzeptanz

`functions/test/beta1BuddyActionsEmulatorTest.js` prüft:

- kanonische Startprojektion und servereigene Preise
- unzureichendes WFXP-Guthaben ohne Nebenwirkungen
- exakte WFXP-Abzüge für Pflege, Spiel und Reinigung
- Ledger-, Kompatibilitäts-Ledger- und Audit-Persistenz
- idempotente Wiederholung ohne Doppelabbuchung
- Cooldown-Schutz
- kostenlose Call-/Search-Aktionen ohne Ledger-Abzug
- serverseitige Zustandsvorbedingungen
- No-effect-Ablehnung ohne Kosten
- ranAway- und Recovery-Logik
- Child-Consent und Guardian-Isolation
- keine Anlage oder Änderung von Legacy-`users.points`-/`users.avatar`-Dokumenten

## Bewusst unverändert

Die allgemeine `users/{userId}`-Economy-Kompatibilitätsbrücke bleibt noch bestehen, weil Dashboard, ältere Mission-Pfade und weitere Produktbereiche separat inventarisiert und migriert werden müssen. Diese Änderung entfernt nur den aktiven Buddy-Writer; sie sperrt nicht vorzeitig andere Bereiche.

## Produktgrenzen

- WFXP sind interne Beta-Punkte ohne Geldwert.
- Kein Token, NFT, Wallet-Transfer, Staking, Buyback oder Cashout wird aktiviert.
- Keine Firebase-Produktivbereitstellung und keine Produktionsdatenänderung sind Teil dieses Blocks.
