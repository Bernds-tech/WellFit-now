# WellFit – Buddy KI Integration

Stand: 2026-04-27

## Ziel

Der KI-Buddy soll intelligente Antworten liefern, ohne die bestehende Architektur zu brechen.

## Architektur

```txt
UI (Guide Flow)
  ↓
BuddyKiProvider (rules / remote-ai)
  ↓
Response
  ↓
Event-System
  ↓
Backend (später Autorität)
```

## Wichtige Regeln

- Keine API Keys im Frontend.
- Keine direkte LLM-Anbindung im Mobile Client.
- KI-Anfragen gehen später über Backend (z. B. /api/buddy-ki).
- Unity bleibt reine Rendering-/Event-Schicht.

## Modi

```txt
rules      → lokal, schnell, deterministisch
mock       → Testdaten
remote-ai  → später echtes Modell über Backend
```

## Warum so aufgebaut?

Damit wir:

- UI nicht neu bauen müssen
- Unity nicht anfassen müssen
- Backend später einstecken können
- Sicherheit behalten

## Nächster Schritt

- API Endpoint definieren
- Server-seitige KI integrieren
- Kontextdaten erweitern
