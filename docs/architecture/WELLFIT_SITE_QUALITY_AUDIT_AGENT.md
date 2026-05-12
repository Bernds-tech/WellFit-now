# WellFit Site Quality Audit Agent

Status: Beta-planend / sichere Agent-Vorstufe
Stand: 2026-05-12

## Ziel

WellFit soll regelmaessig automatisch geprueft werden, damit fehlende Punkte, UX-Probleme, SEO-Luecken, Performance-Themen, Accessibility-Probleme und Conversion-Luecken frueh sichtbar werden.

Der Agent soll nicht unkontrolliert Aenderungen machen, sondern zuerst Reports und TODO-Kandidaten erzeugen.

## Grundsatz

> Erst messen, dann bewerten, dann TODO-Kandidaten erzeugen, dann gezielt bauen.

Keine automatische Aktivierung von Tracking, externen Skripten, Clarity, Analytics oder KI-APIs ohne Datenschutz-/Consent-Pruefung.

## Tool-Schichten

### Stufe 1 - lokal und sicher

Im Repository ausfuehrbar, ohne externe API-Calls:

- Routen-Inventur
- SEO-Metadaten-Suche
- Accessibility-Heuristiken
- CTA-/Conversion-Hinweise
- Beta-/Safety-Hinweise
- Token-/NFT-/Wallet-/Auszahlungs-Sprache pruefen
- fehlende Alt-Texte / fehlende Headings / problematische Buttons heuristisch erkennen
- Report in `scripts/wellfit-dev-agent/output/site-quality-audit-report.md`

### Stufe 2 - Lighthouse / PageSpeed

Spaeter optional:

- Google PageSpeed Insights manuell oder per API
- Lighthouse CI lokal oder im Server-Agenten
- Performance, Accessibility, Best Practices, SEO
- Keine automatische Abhaengigkeit im MVP, solange Build stabil bleiben muss

### Stufe 3 - UX-Verhalten

Spaeter optional mit Consent/Datenschutz:

- Microsoft Clarity oder vergleichbare Heatmaps / Session-Replays
- nur nach Datenschutz- und Cookie-/Consent-Pruefung
- keine sensiblen Gesundheits-, Kinder-, Standort- oder Kamera-Daten ungeprueft tracken

### Stufe 4 - SEO-Profi-Audit

Spaeter optional:

- Screaming Frog
- Search Console
- Ahrefs / Semrush / SE Ranking
- Backlinks, Keywords, Meta-Daten, Indexierung, Canonicals, Broken Links

### Stufe 5 - KI-Auswertung

Spaeter optional:

- Screenshots und Report-Dateien koennen von ChatGPT analysiert werden
- Ziel: Verbesserungs-TODOs, UX-Hinweise, Text-/CTA-Verbesserungen
- keine autonomen riskanten Codeaenderungen ohne Quality Gate

## Was der lokale Agent pruefen darf

- Welche App-Routen existieren.
- Ob `page.tsx`-Dateien erkennbare Ueberschriften haben.
- Ob Seiten klare CTA-Woerter enthalten.
- Ob Seiten Beta-/Safety-Hinweise enthalten, wo Economy/Rewards vorkommen.
- Ob problematische echte Token-/NFT-/Wallet-/Auszahlungs-Woerter in aktiven UI-Seiten auftauchen.
- Ob Bilder Alt-Texte haben.
- Ob Buttons ohne Text/Label erkennbar sind.
- Ob wichtige Produktbereiche sichtbar sind.

## Was der lokale Agent nicht tun darf

- keine echten Nutzer tracken
- keine Clarity/Analytics-Skripte einbauen
- keine externen API-Keys verlangen
- keine OpenAI-/Google-/Ahrefs-/Semrush-Keys brauchen
- keine automatischen Codewrites
- keine Token/NFT/Wallet-Funktionen aktivieren
- keine Datenschutz-/Consent-Entscheidungen ueberspringen

## Report-Regeln

Der Report soll enthalten:

- Summary
- Routenliste
- Warnungen nach Prioritaet
- TODO-Kandidaten
- Sicherheitshinweise
- naechste empfohlene Schritte

Prioritaeten:

- P0: Sicherheits-/Compliance-Risiko
- P1: Build-/Navigation-/kritischer UX-Bruch
- P2: SEO/Accessibility/Conversion-Luecke
- P3: Feinschliff

## Spaetere Integration in Agent-Lauf

Moeglicher npm-Befehl:

```bash
npm run agent:site-quality
```

Der Befehl soll nur einen Report erzeugen.

Erst spaeter kann ein Quality-Gate daraus harte Kriterien ableiten.

## Datenschutz und Consent

Vor Clarity, Analytics, Heatmaps oder Session-Replays muss geprueft werden:

- Datenschutzerklaerung
- Cookie-/Consent-Mechanik
- sensible Datenmaskierung
- Gesundheitsdaten
- Standortdaten
- Kinder-/Jugenddaten
- Kamera-/AR-Daten

Siehe:

- `docs/architecture/HEALTH_WATCH_LOCATION_PRIVACY_GUARDRAILS.md`

## Fuehrende Dateien

- `scripts/wellfit-dev-agent/src/site-quality-audit.mjs`
- `scripts/wellfit-dev-agent/output/site-quality-audit-report.md`
- `todolist/CODEBASE_FEATURE_MAP.md`
- `todolist/PROJECT_STRUCTURE.md`
- `todolist/TODO_INDEX.md`

## Offene Folgeaufgaben

- [ ] Lokalen Site-Quality-Audit-Agenten einbauen.
- [ ] npm Script `agent:site-quality` ergaenzen.
- [ ] Report lokal testen.
- [ ] Nach stabilem Report optional in `agent:quality-gate` als Warnung, nicht als Blocker, aufnehmen.
- [ ] Spaeter Lighthouse/Clarity/Screaming-Frog-Integration gesondert planen.

## KI-Fortsetzungs-Prompt

Bei Fragen zu SEO, UX, Conversion, Accessibility, PageSpeed, Clarity, Lighthouse, Search Console, Screaming Frog oder Website-Qualitaet zuerst diese Datei lesen. Keine Tracking-Skripte, externen APIs oder Keys einbauen, bevor Datenschutz/Consent geklaert ist. Zuerst lokale Reports erzeugen, dann TODO-Kandidaten, dann gezielte Umsetzung mit Quality Gate und Build.