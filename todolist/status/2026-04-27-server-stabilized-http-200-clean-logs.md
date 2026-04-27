# Statusnotiz – Server stabilisiert / HTTP 200 / Logs sauber

Datum: 2026-04-27
Repository: Bernds-tech/WellFit-now

## Ergebnis

[x] `.next/BUILD_ID` vorhanden.
[x] `.next/prerender-manifest.json` vorhanden.
[x] `.next/server/middleware-manifest.json` vorhanden.
[x] PM2-Prozess `wellfit-now` geloescht und sauber neu angelegt.
[x] PM2 Prozessliste gespeichert.
[x] `wellfit-now` online.
[x] `curl -I http://localhost:3000` liefert `HTTP/1.1 200 OK`.
[x] `curl -I https://www.wellfit-now.io` liefert `HTTP/1.1 200 OK`.
[x] PM2 Logs nach Flush: Error-Log leer.

## Behobene Ursache

Vorher startete `next start` zeitweise parallel zu einem noch laufenden `next build`. Dadurch war `.next` unvollstaendig und `next start` fand keine gueltige Production-Build-Struktur.

## Stabiler Deployment-Ablauf fuer die Zukunft

1. PM2 stoppen.
2. Sicherstellen, dass kein `next build` oder `next start` parallel laeuft.
3. `.next` nur entfernen, wenn PM2 gestoppt ist.
4. `npm run build` komplett durchlaufen lassen.
5. Erst danach PM2 starten/restarten.
6. Mit `curl -I` und PM2 Logs pruefen.

## Aktueller naechster Block

Stufe 1 fortsetzen:

- Unplausible Sessions detaillierter markieren.
- Wiederholtes Fake-/Pattern-Verhalten erkennen.
- Device-/Session-Muster erkennen.
- Cooldown-/Rate-Limit-Grundlage vorbereiten.
