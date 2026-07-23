# WellFit Beta 1 – Mobile Pose Review Runtime

Stand: 2026-07-23  
Status: Implementierungs- und Prüfpfad für die mobile Kniebeugen-Mission

## Zweck

Der mobile Kniebeugen-Screen verwendet den kanonischen Beta-1-Missionskatalog und den bestehenden serverseitigen Ablauf:

```txt
On-Device Kamera/Pose-Erkennung
  -> Tracking Session Callable
  -> begrenzte Pose-Zusammenfassung
  -> Mission Attempt
  -> Mission Evidence
  -> Admin Review
  -> Mission Completion
  -> WFXP Ledger + Wallet
```

Es wird kein zweites Missions- oder Belohnungssystem eingeführt.

## Kanonische Mission

```txt
Mission-ID: daily-squats-15
Ziel: 15 saubere Kniebeugen
Katalogwert: 9 WFXP
Evidence-Typ: daily-user-confirmation
Review: erforderlich
Completion-Grenze: einmal pro Nutzer und Europe/Vienna-Tag
```

## Datenschutzgrenze

Die Kameraauswertung erfolgt lokal auf dem Gerät. An Firebase werden weder Bilder noch Videos übertragen oder gespeichert.

Der Server erhält ausschließlich eine begrenzte Zusammenfassung:

```txt
exercise
targetReps
validReps
invalidReps
qualityScore
confidence
moodSignal
rawMediaStored = false
rawMediaUploaded = false
onDeviceAnalysis = true
```

Die Zusammenfassung ist ein Triage-Signal und keine automatische Freigabe.

## Serverfunktionen

### `createTrackingSession`

- authentifiziert
- bindet die Tracking-Session an Nutzer und Mission
- markiert `proofType = pose`
- autorisiert keine WFXP und keine Mission Completion

### `recordPoseTrackingProof`

- akzeptiert nur die eigene Pose-Tracking-Session
- lehnt Motion- oder fremde Sessions ab
- erzeugt ein deterministisches, idempotentes `trackingProofEvents`-Dokument
- begrenzt numerische Werte
- speichert keine Rohmedien
- autorisiert keine Rewards

### `submitMissionEvidence`

- verweist über privacy-minimierte Metadaten auf das serverseitige Proof-Dokument
- setzt den Status auf `pending-server-review`
- gewährt keine WFXP

### `adminListMissionEvidence`

- zeigt keine freien Metadatenwerte, Storage-Inhalte, Bilder oder Videos
- prüft Eigentümer-, Missions- und Proof-Zuordnung
- liefert nur eine sichere Pose-Zusammenfassung und einen Verifikationsstatus

### `adminReviewMissionEvidence`

- bleibt getrennte, auditierbare Admin-Entscheidung
- die UI blockiert `approved` nach reiner Metadatenprüfung
- Freigabe benötigt externen, gespeicherten oder Emulator-/QA-Nachweis und eine Begründung

### `completeMissionAttempt`

- benötigt freigegebene Evidence
- erzeugt genau eine serverseitige WFXP-Buchung
- bleibt idempotent
- erzeugt keine Token-, Zahlungs- oder Cash-out-Autorität

## Entfernte Client-Autorität

Der mobile Kniebeugenpfad schreibt nicht mehr direkt in:

```txt
trackingSessions
trackingProofEvents
users.points
users.avatar
users.lastMissionCompletedAt
missionBuddyEvents
```

Die alte `missionBuddyBridge.ts` wurde entfernt. Buddy-Zustände bleiben in der getrennten serverseitigen Buddy-Care-Runtime.

## Emulator-Abdeckung

Der fokussierte Test prüft:

- eigene Pose-Session erfolgreich
- Fremdnutzer blockiert
- Motion-Session blockiert
- idempotente Proof-Erstellung
- unveränderliche erste Zusammenfassung bei Replay
- keine Rohmedien
- keine Reward-Autorität beim Tracking oder Evidence-Upload
- verifizierte privacy-minimierte Adminprojektion
- sichtbarer Fehlerstatus bei fehlendem Proof
- Admin-Review und anschließende Completion
- exakt 9 WFXP und genau ein Ledger-Ereignis
- kein Anlegen eines alten `users.points`-/Avatar-Dokuments

## Produktgrenzen

- WFXP sind interne Beta-Punkte ohne Geldwert.
- Keine Auszahlung, kein Token, kein NFT und keine Blockchain-Übertragung.
- Kein automatischer medizinischer oder gesundheitlicher Befund.
- Pose-Scores ersetzen keine fachliche Bewertung und keine Adminentscheidung.
- Child Profiles bleiben für den ersten Tagesmissionskatalog deaktiviert.
