# CODEX PROMPT - Beta1 Leaderboard Readonly

Branch: `runtime/beta1-leaderboard-readonly`  
Status: prompt_only

## Ziel

Privacy-safe read-only Leaderboard fuer XP/Mission/Checkpoint-Projections implementieren.

## Sicherheitsanforderungen

- keine oeffentlichen Kinderprofile
- keine sensiblen Standortdaten
- opt-out/Privacy beruecksichtigen
- keine clientseitige Ranking-Authority

## Stop-Bedingungen

- Datenmodell fehlt
- Rules fehlen
- Opt-out/Privacy-Grenzen koennen nicht eingehalten werden

## Checks

- `npm run lint`
- `npm run build`
- `git diff --check`
- `npm run agent:validate`
