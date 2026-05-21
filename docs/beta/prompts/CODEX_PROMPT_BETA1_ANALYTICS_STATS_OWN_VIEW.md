# CODEX PROMPT - Beta1 Analytics Stats Own View

Branch: `runtime/beta1-analytics-stats-own-view`  
Status: prompt_only

## Ziel

Eigene Stats/Progress fuer Beta-1 anzeigen (plus anonymisierte Aggregates), ohne medizinische oder sensitive Auswertung.

## Grenzen

- keine Gesundheitsdiagnose
- keine Rohdaten anderer Nutzer
- keine Child-/Location-Rohdaten
- keine neue Runtime-Authority

## Stop-Bedingungen

- Diagnose-/Medical-Claim waere noetig
- sensitive Raw-Daten waeren noetig
- Functions/Rules Aenderungen waeren noetig

## Checks

- `npm run lint`
- `npm run build`
- `git diff --check`
- `npm run agent:quality-gate`
