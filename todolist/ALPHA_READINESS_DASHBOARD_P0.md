# WellFit – Alpha Readiness Dashboard P0

Version: 1.0
Stand: 2026-05-01
Zweck: Schneller Ueberblick, ob WellFit fuer eine testbare Alpha bereit ist

---

## Gesamtstatus

```txt
Alpha Readiness: [~] In Vorbereitung
Hauptblocker: Unity Debug-Batch noch nicht erneut kompiliert/getestet
Aktiver Branch: wellfit/upload-local-unity-ar-buddy
Aktiver PR: #13
```

---

## 1. Zugang / Nutzerbasis

| Bereich | Status | Notiz |
|---|---|---|
| Login | [~] | bestehende App-Basis vorhanden, vor Alpha erneut pruefen |
| Registrierung | [~] | bestehende App-Basis vorhanden, vor Alpha erneut pruefen |
| Nutzerprofil-Grundlage | [~] | fuer Alpha minimal ausreichend halten |
| Auth/Session | [~] | vor Alpha Smoke-Test noetig |

Alpha-Bedingung:

```txt
Nutzer kann sich anmelden oder Testnutzer kann reproduzierbar starten.
```

---

## 2. Unity / AR-Buddy

| Bereich | Status | Notiz |
|---|---|---|
| Unity Projekt im Repo | [x] | native/unity/WellFitBuddyAR |
| Android Smoke-Test alt | [x] | vor Debug-Batch erfolgreich |
| Debug-Batch Compile | [ ] | offen |
| Android Retest | [ ] | offen |
| Buddy platzieren | [~] | alt erfolgreich, neu pruefen |
| Buddy bewegen | [~] | alt erfolgreich, neu pruefen |
| Buddy rufen | [~] | neu vorbereitet, Retest offen |
| 4 Debug-Seiten | [ ] | Retest offen |

Alpha-Bedingung:

```txt
Buddy laesst sich platzieren, bewegen und rufen; Build laeuft auf Android.
```

---

## 3. Mission / Game Loop

| Bereich | Status | Notiz |
|---|---|---|
| einfache Missionen | [~] | vorhanden, nach AR-Retest erneut im Fluss pruefen |
| Guide-/Mission-Hinweise | [~] | Unity Debug vorbereitet |
| Nutzer versteht naechsten Schritt | [ ] | UX-Test offen |
| internes Feedback | [~] | Punkte/XP/Preview-Konzept vorhanden |

Alpha-Bedingung:

```txt
Nutzer versteht: Was soll ich tun? Was passiert danach? Kein echter Token/NFT-Kontext.
```

---

## 4. Punkte / XP / Rewards

| Bereich | Status | Notiz |
|---|---|---|
| interne Punkte/XP | [~] | Konzept vorhanden |
| echte Token | [>] | nicht Alpha |
| NFTs | [>] | nicht Alpha |
| RewardPreview/Security | [x] | Grundlage vorhanden |
| serverseitige Richtung | [~] | weiter ausbauen nach P0 |

Alpha-Bedingung:

```txt
Feedback darf motivieren, aber keine echte Auszahlung/Token/NFT erzeugen.
```

---

## 5. Backend / Security

| Bereich | Status | Notiz |
|---|---|---|
| Firestore Rules Grundlage | [x] | vorhanden |
| Callable Functions Grundlage | [x] | vorhanden |
| direkte kritische Client-Writes blockiert | [x] | laut Roadmap vorhanden |
| Emulator Tests | [x] | Grundlage vorhanden |
| Unity Event Ingestion | [>] | spaeter logged-only |

Alpha-Bedingung:

```txt
Client/Unity autorisiert keine Rewards, Completion, Tokens, NFTs oder Anti-Cheat.
```

---

## 6. QA / Teststeuerung

| Bereich | Status | Notiz |
|---|---|---|
| PC Retest Checklist | [x] | vorhanden |
| QA Test Matrix | [x] | vorhanden |
| Retest Report Template | [x] | vorhanden |
| Decision Matrix | [x] | vorhanden |
| P0 Blocker Register | [x] | vorhanden |

Alpha-Bedingung:

```txt
Fehler koennen reproduzierbar gemeldet, bewertet und priorisiert werden.
```

---

## 7. Nicht Alpha-blockierend

Diese Themen bleiben erhalten, blockieren aber nicht die Alpha:

```txt
Voice Runtime
TTS
Wake Word
viele Avatar-Typen
echte NFT/WFT/Blockchain
Marketplace
DePIN
B2B Whitelabel
freie Voice Chats
komplexe Avatar-Langzeitentwicklung
```

---

## Naechster P0-Schritt

```powershell
cd C:\wellfit\WellFit-now
git checkout wellfit/upload-local-unity-ar-buddy
git pull --ff-only origin wellfit/upload-local-unity-ar-buddy
```

Unity-Projekt:

```txt
C:\wellfit\WellFit-now\native\unity\WellFitBuddyAR
```

Dann:

```txt
1. Compile pruefen
2. Android Build/Run
3. 4 Debug-Seiten testen
4. Retest Report ausfuellen
5. Decision Matrix anwenden
6. Blocker Register aktualisieren
```

---

## Status

[~] Alpha-Readiness-Dashboard angelegt.
[ ] Unity-Retest offen.
