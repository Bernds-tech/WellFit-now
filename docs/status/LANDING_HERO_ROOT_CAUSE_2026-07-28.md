# Landing Hero Rendering Root Cause Analysis

Stand: 2026-07-28

## Beobachtung

Die öffentliche Landingpage rendert Text, Navigation, Logo und bestehende SVG-Karten, während die beiden neu hinzugefügten WebP-Hero-Assets auf Staging nicht sichtbar sind.

## Verifizierte Fakten

- Die Hero-Komponente ist in `main` vorhanden.
- Die WebP-Dateien sind als gültige Git-Blobs unter `public/landing` vorhanden.
- Der Docker-Build kopiert das vollständige `public`-Verzeichnis in das Runtime-Image.
- Nginx leitet alle Pfade an den Next.js-Container weiter.
- Die bestehende CI prüfte bisher ausschließlich `/api/health`; sie prüfte weder die Landingpage-Markierung noch die kritischen Hero-Assets.

## Wahrscheinlichste Fehlerklasse

Der Fehler liegt nicht mehr im Layout oder in der Z-Index-Struktur. Die gemeinsame Fehlerklasse der beiden fehlenden Bilder ist der Laufzeitpfad für neu hinzugefügte statische WebP-Dateien beziehungsweise ein nicht nachgewiesener Staging-Release. Ein grüner Healthcheck beweist nur, dass der Node-Prozess antwortet, nicht dass die öffentliche Landingpage und ihre Assets im aktiven Container vorhanden sind.

## Korrekturstrategie

1. Kritische Hero-Assets werden aus `app/assets/landing` statisch importiert und dadurch als gehashte Next.js-Build-Assets unter `/_next/static/media` gebündelt.
2. Für diese beiden Bilder wird der Image-Optimizer umgangen (`unoptimized`), damit kein zusätzlicher Optimizer-Endpunkt beteiligt ist.
3. Container-CI prüft künftig die Landingpage-Markierung und lädt beide gebündelten WebP-Dateien aus dem laufenden Container.
4. Das Deployment prüft nach der Aktivierung den tatsächlich laufenden Container über SSH auf dieselbe Markierung und beide Assets.

Damit ist künftig klar getrennt nachgewiesen: im Code vorhanden, im Container ausgeliefert und auf dem aktiven Staging-Container verfügbar.
