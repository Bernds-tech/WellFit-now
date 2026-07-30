# Canonical Truth Change Proposals

Status: owner-review-required

Diese Datei ist der normale Ablageort fuer Aenderungsvorschlaege zur WellFit Beta-1 Canonical Truth.

Geschuetzte Dateien:

- `project-register/wellfit-beta1-canonical-truth.json`
- `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md`
- `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md`

Agents duerfen diese Dateien lesen und referenzieren, aber nicht autonom aendern. Wenn ein Agent eine Aenderung fuer noetig haelt, schreibt er hier einen Vorschlag und wartet auf explizite Bernd-/Owner-Freigabe.

## Proposal Template

```md
## Proposal: <kurzer Titel>

- Date:
- Proposed by:
- Affected protected file:
- Affected concept area:
- Reason:
- Proposed change summary:
- Risk if changed:
- Risk if not changed:
- Requires owner approval: yes
- Owner decision:
```

## KI-Fortsetzungs-Prompt

Lies zuerst `AGENTS.md`, `todolist/WORK_MAP.md`, `todolist/TODO_INDEX.md` und `todolist/NEXT_ACTIONS.md`.

Beta-1 Canonical Truth Pflicht:
- Vor Beta-1 Governance-Aenderungen immer `project-register/wellfit-beta1-canonical-truth.json`, `docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md` und `todolist/CODEX_CONTEXT_WELLFIT_BETA1.md` lesen.
- Die drei Canonical-Truth-Dateien sind owner-protected/read-only fuer Agenten.
- Keine Aenderung an owner-protected Canonical-Truth-Dateien ohne explizite Owner-Freigabe.
- Falls Aenderung noetig: nur Vorschlag in `todolist/CANONICAL_TRUTH_CHANGE_PROPOSALS.md` dokumentieren.

Produktgrenzen:
- WFP = interne Punkte in Beta-1.
- XP = Avatar-Fortschritt.
- WFT/SUI/Blockchain/Token/NFT/Payment/Cashout sind nicht Beta-1 aktiv.
- Keine echte GitHub API, kein echtes Deploy, Runner bleibt metadata_only, Admin/Owner approval erforderlich.


## Proposal: Canonical-Truth Prompt Marker Strategy for Quality Gate

- Date: 2026-05-23
- Proposed by: Codex (fix/agent-admin-quality-gate-follow-up)
- Affected protected file: docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md, todolist/CODEX_CONTEXT_WELLFIT_BETA1.md
- Affected concept area: Quality-Gate continuation-prompt enforcement vs owner-protected canonical-truth files
- Reason: Quality gate still requires KI-Fortsetzungs-Prompt markers on two owner-protected files.
- Proposed change summary: Either (A) owner adds minimal KI-Fortsetzungs-Prompt marker text directly in both protected files, or (B) quality-gate/memory-sync logic is owner-approved to allow companion prompt file `todolist/CODEX_PROMPT_AGENT_CANONICAL_TRUTH_INTEGRATION.md` as compliant proxy for those two protected files.
- Risk if changed: Wrong implementation could weaken owner-protection semantics if proxy logic is too broad.
- Risk if not changed: `npm run agent:quality-gate` remains red on Required KI-Fortsetzungs-Prompts and continues blocking AutoMerge/RealRunner.
- Requires owner approval: yes
- Owner decision:

## Proposal: WFXP waehrend der ersten Alpha beibehalten

- Date: 2026-07-30
- Proposed by: Codex nach Owner-Interview mit Bernd
- Affected protected file: project-register/wellfit-beta1-canonical-truth.json, docs/architecture/WELLFIT_BETA1_CANONICAL_TRUTH.md, todolist/CODEX_CONTEXT_WELLFIT_BETA1.md
- Affected concept area: Alpha-Economy, WFXP/WFP/XP-Terminologie und spaetere Migration
- Reason: Bernd hat in der strukturierten Fragerunde entschieden, dass die bestehende gemeinsame Einheit WFXP fuer die erste Alpha bestehen bleibt und WFit Points sowie XP erst spaeter kontrolliert getrennt werden. Die derzeit geschuetzte Canonical Truth fordert dagegen bereits in Beta 1 eine strikte WFP-/XP-Trennung.
- Proposed change summary: Die geschuetzte Wahrheit soll nach einem eigenen Owner-geprueften Aenderungsschritt festhalten, dass die erste Alpha voruebergehend WFXP als gemeinsame, interne, nicht uebertragbare und nicht monetaere Einheit verwendet. Die spaetere Trennung in ausgebbare WFit Points und nicht ausgebbare XP bleibt Ziel einer versionierten Migration. Alle Grenzen gegen WFT, SUI, Solana, Blockchain, Wallet, NFT, Presale, Payment und Cash-out bleiben unveraendert.
- Risk if changed: WFXP koppelt Ausgabe- und Fortschrittslogik laenger zusammen; Datenmodell, Balancing und spaetere Migration werden aufwendiger. Begriffe in Tests, UI, Dokumentation und Backend muessen bis zur Migration konsistent als temporaer markiert werden.
- Risk if not changed: Canonical Truth, aktuelle Runtime und Bernds ausdrueckliche Alpha-Entscheidung widersprechen einander. Agenten koennten eine ungewollte Sofortmigration beginnen oder dieselbe Economy-Arbeit doppelt ausfuehren.
- Requires owner approval: yes
- Owner decision: Produktentscheidung von Bernd am 2026-07-30 bestaetigt; geschuetzte Dateien in diesem Interview noch nicht geaendert. Separater Scope-/Migrationsreview erforderlich.
