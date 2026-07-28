# Public Landing Visual Assets

Stand: 2026-07-28

## Zweck

Diese Datei dokumentiert die aktuell verwendeten visuellen Assets der öffentlichen WellFit-Website. Der Arbeitsbereich bleibt auf die öffentliche Landingpage und die Abschnitte `So funktioniert’s` bis `Über uns` begrenzt.

## Aktive Assets

| Datei | Verwendung |
|---|---|
| `public/landing/hero-background-wellfit.webp` | von Bernd bereitgestellte Abenteuerlandschaft als echter Hintergrund der ersten Landingpage-Sektion |
| `public/landing/hero-phone-fox-stage.webp` | optimierte transparente Bühne aus dem bereitgestellten WellFit-Handy und dem Fuchs-Forscher-Buddy; Hero und öffentlicher Buddy-Bereich |
| `public/landing/feature-movement.svg` | Feature-Karte Bewegung im Alltag |
| `public/landing/feature-wfxp.svg` | Feature-Karte WFXP / Belohnungen |
| `public/landing/feature-buddy-care.svg` | bestehende unterstützende Buddy-Pflege-Illustration |
| `public/landing/feature-missions.svg` | Feature-Karte reale Missionen und Roadmap-Vorschau Bürgermeister |
| `public/buddy/luma.png` | bestehender Buddy in älteren öffentlichen Motiven; wird schrittweise durch die final bereitgestellten Buddy-Varianten ersetzt |
| `public/logo.png` | bestehendes offizielles WellFit-Logo |

## Gestaltungsregeln

- dunkle Petrol-/Türkis-Basis
- Cyan für Technologie und Orientierung
- Gelb/Orange für Fortschritt, Missionen und CTAs
- Text nie direkt auf unruhige Bildbereiche legen; dunkle Overlays erhalten
- Bildmotive unterstützen die Aussage, ersetzen aber keine verständlichen Texte
- Bürgermeister-, Kinder-/Familien- und öffentliche Community-Funktionen als geplant kennzeichnen
- keine internen Produkt-, Firebase-, Reward-, Mission- oder Buddy-KI-Systeme aus dieser Website-Arbeit verändern

## Aktueller Implementierungsstand

- Der Landschaftshintergrund wird als eigener positiver Bild-Layer gerendert.
- Handy und Fuchs-Forscher werden als separate transparente Hero-Bühne über dem Hintergrund dargestellt.
- Die Komposition bleibt responsiv und erscheint auf kleineren Ansichten unter dem Text statt vollständig zu verschwinden.
- Der Abschnitt `Dein Buddy` verwendet nun die freigegebene Handy-/Fuchs-Bühne statt der generischen Pflegegrafik.
- Fuchs, Tiger, Panda und Elefant werden als vier öffentliche Charakterrichtungen beschrieben.
- Basis-, Forscher- und Wächter-Ausrüstung werden ausdrücklich als öffentliche Design-Vorschau dargestellt; daraus wird keine bereits aktive interne Auswahl- oder Rollenfunktion abgeleitet.

## Nächste visuelle Ausbaustufe

- reale Screenshot-Prüfung nach Staging-Deployment
- exakte Position von Handy, Fuchs und Statuskarte auf Desktop feinjustieren
- weitere bereitgestellte Buddy-Varianten nach visueller Abnahme als optimierte Einzel- oder Gruppenassets ergänzen
- Lighthouse-, Bildgrößen- und Kontrastprüfung
