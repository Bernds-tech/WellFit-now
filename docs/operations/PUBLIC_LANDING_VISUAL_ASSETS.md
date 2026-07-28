# Public Landing Visual Assets

Stand: 2026-07-28

## Zweck

Diese Datei dokumentiert die aktuell verwendeten visuellen Assets der öffentlichen WellFit-Website. Der Arbeitsbereich bleibt auf die öffentliche Landingpage und die Abschnitte `So funktioniert’s` bis `Über uns` begrenzt.

## Aktive Assets

| Datei | Verwendung |
|---|---|
| `assets/landing/hero-composite-v12/chunk-00.txt` bis `chunk-03.txt` | versionierte, prüfbare Quellsegmente der freigegebenen Hero-Komposition |
| `scripts/landing/materialize-hero-assets.mjs` | rekonstruiert und prüft die Hero-Komposition vor jedem Build |
| `public/landing/hero-composite-v12.webp` | während des Builds erzeugter Hero-Hintergrund mit Abenteuerwelt, WellFit-Handy und Fuchs-Forscher |
| `public/landing/feature-movement.svg` | Feature-Karte Bewegung im Alltag |
| `public/landing/feature-wfxp.svg` | Feature-Karte WFXP / Belohnungen |
| `public/landing/feature-buddy-care.svg` | bestehende unterstützende Buddy-Pflege-Illustration |
| `public/landing/feature-missions.svg` | Feature-Karte reale Missionen und Roadmap-Vorschau Bürgermeister |
| `public/logo.png` | bestehendes offizielles WellFit-Logo |

## Gestaltungsregeln

- dunkle Petrol-/Türkis-Basis
- Cyan für Technologie und Orientierung
- Gelb/Orange für Fortschritt, Missionen und CTAs
- Text nie direkt auf unruhige Bildbereiche legen; dunkle Overlays erhalten
- Bildmotive unterstützen die Aussage, ersetzen aber keine verständlichen Texte
- Bürgermeister-, Kinder-/Familien- und öffentliche Community-Funktionen als geplant kennzeichnen
- keine internen Produkt-, Firebase-, Reward-, Mission- oder Buddy-KI-Systeme aus dieser Website-Arbeit verändern

## Verifizierte Fehlerursache und Korrektur

- Die früheren Dateien `hero-background-wellfit.webp` und `hero-phone-fox-stage.webp` waren unvollständig beziehungsweise als WebP nicht vollständig dekodierbar.
- Die fehlerhaften Dateien wurden aus dem aktiven Bestand entfernt.
- Die neue Hero-Komposition wird aus vier Textsegmenten rekonstruiert.
- Das Build-Skript prüft Segmentlängen, Segmentprüfsummen, Gesamtgröße, RIFF-/WEBP-Signatur und SHA-256 der fertigen Datei.
- Erwartete fertige Datei: 21.936 Byte, SHA-256 `b24ac57ea55bd9010bd2380bab1a5b2cdfb04083ce971bd795e844622893dfcf`.
- Container-CI ruft die gerenderte Landingpage und die fertige Datei aus dem laufenden Container ab.
- Das Staging-Deployment prüft nach der Aktivierung zusätzlich Release-SHA, Landingpage-Markierung und dieselbe Datei direkt im aktiven Server-Container.

## Aktueller Implementierungsstand

- Der Hero verwendet eine einzige geprüfte Komposition mit Landschaft, App und Fuchs-Forscher.
- Die linke Textzone besitzt einen kontrollierten Lesbarkeitsverlauf.
- Feature-Karten und öffentliche Abschnitte bleiben eigenständige HTML-Inhalte.
- Der Abschnitt `Dein Buddy` erklärt Fuchs, Tiger, Panda und Elefant als öffentliche Designrichtungen.
- Basis-, Forscher- und Wächter-Ausrüstung bleiben ausdrücklich Design-Vorschau; daraus wird keine aktive interne Auswahlfunktion abgeleitet.

## Nächste visuelle Ausbaustufe

- Screenshot-Prüfung nach nachgewiesen erfolgreichem Staging-Deployment
- exakte Position und Abdunklung auf Desktop, Tablet und Smartphone feinjustieren
- weitere bereitgestellte Buddy-Varianten nach visueller Abnahme ergänzen
- Lighthouse-, Bildgrößen- und Kontrastprüfung
