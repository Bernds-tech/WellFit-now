# CODEX PROMPT - Beta1 Professional UI Foundation

Branch: `runtime/beta1-professional-ui-foundation`  
Status: prompt_only

## Ziel

Professionelleren UI-Stil fuer bestehende Beta-1-Flaechen vorbereiten (ruhiger, klarer, Health-Tech/Dashboard-orientiert), ohne neue Runtime-Authority einzufuehren.

## Erlaubte Dateien (nach Freigabe)

- `app/**`
- `components/**`
- `lib/**`
- `docs/beta/**`
- `todolist/**`
- `project-register/**`

## Verboten

- `functions/**`, `functions/lib/**`, `functions/test/**`
- `firestore.rules`, `firebase.json`
- `.github/**`
- Secrets, Deploys, Production-Firebase-IDs
- Token/NFT/Payment/Cashout/Blockchain-Funktionen

## Design-Guardrails

- Health-Tech statt Spielzeug-Optik
- reduzierte Neon-/Glow-/Gradient-Effekte
- bessere Typografie, konsistente Abstaende
- klare CTA-Hierarchie, seriöse Tabellen/Karten
- Gamification funktional belassen, visuell nicht ueberladen

## Checks

- `npm run lint`
- `npm run build`
- `git diff --check`
- Bestaetigung: no protected runtime authority

## Stop-Bedingungen

- Runtime-Authority waere noetig
- Functions/Rules Aenderung waere noetig
- Token/Payment/Cashout/NFT-Implikation entsteht
- Pilotfreigabe ohne Evidence verlangt wird
