# Incident – Production Internal Server Error

Datum: 2026-05-01
Status: P0 Incident / Live-Seite zeigt Internal Server Error

---

## Kurzstand

Die Live-Seite zeigt aktuell:

```txt
Internal Server Error
```

Das ist P0-kritisch und hat Vorrang vor Unity-/AR-Buddy-Planung.

PR #13 ist offen und nicht in `main` gemerged. Die zuletzt erstellten Unity-/ToDo-Planungsdokumente sollten die Live-Seite nicht direkt beeinflussen, solange der Server nicht manuell diesen Branch deployed hat.

---

## Wahrscheinlichste Ursachen

```txt
Next.js Runtime-Fehler
PM2-Prozess fehlerhaft
unvollstaendiger .next Build
fehlende/kaputte node_modules
fehlende Env Variable
Server lief waehrend Build/Install neu an
Route/API wirft Exception
falscher Branch/halb aktualisierter Deploy-Stand
```

---

## Sofort-Pruefung am Server

Root:

```bash
cd /var/www/WellFit-now
pwd
git branch --show-current
git status --short
git log -1 --oneline
pm2 status
pm2 logs wellfit-now --lines 80
```

Wichtig:

- Welche Route wirft den Fehler?
- Gibt es Stacktrace?
- Fehlt ein Modul?
- Fehlt eine Env Variable?
- Ist `.next` vorhanden/korrekt?

---

## Schneller Health-Check

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/mobile
curl -I http://localhost:3000/mobile/ar
curl -I http://localhost:3000/dashboard
```

Falls nginx davor liegt:

```bash
curl -I https://DEINE-DOMAIN/
```

---

## Sicherer Rebuild-Pfad

Nur ausfuehren, wenn Logs nicht direkt einen kleinen Fix zeigen.

```bash
cd /var/www/WellFit-now
git fetch origin
git reset --hard origin/main
npm install --include=dev --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
pm2 logs wellfit-now --lines 80
```

---

## Wenn npm install fehlschlaegt

Bekannte Hinweise aus Roadmap:

```txt
ENOTEMPTY bei firebase-tools oder node_modules kann auftreten.
Wenn Build danach nicht laeuft, node_modules sauber bereinigen und neu installieren.
```

Moeglicher Cleanup:

```bash
cd /var/www/WellFit-now
rm -rf node_modules package-lock.json
npm install --include=dev --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
```

Nur nutzen, wenn normales Install/Build fehlschlaegt.

---

## Wenn Build gruen, aber Seite weiter 500

Dann Runtime/Env pruefen:

```bash
pm2 logs wellfit-now --lines 120
pm2 show wellfit-now
ls -la .next
printenv | grep -E "NEXT|FIREBASE|OPENAI|NODE"
```

Achtung: Secrets nicht in Chat kopieren. Nur Fehlermeldung/Variablennamen nennen, keine Werte.

---

## Wenn Route-spezifisch

Wenn nur eine Route betroffen ist, z. B. `/mobile/ar`:

```bash
curl -I http://localhost:3000/mobile/ar
pm2 logs wellfit-now --lines 120
```

Dann betroffene App-Dateien pruefen.

---

## Entscheidungslogik

```txt
Logs zeigen missing module -> npm install / Dependency pruefen
Logs zeigen env missing -> Env setzen / Fallback pruefen
Logs zeigen build artifact missing -> npm run build
Logs zeigen route exception -> betroffene Route fixen
PM2 down/restarting -> pm2 restart / logs pruefen
Alles unklar -> git reset origin/main + sauberer Build
```

---

## Nicht tun

[!] Nicht Unity Branch auf Produktion deployen.
[!] Nicht PR #13 auf Server ziehen fuer Live-Fix.
[!] Keine Secrets in Chat kopieren.
[!] Nicht mehrere PM2-Instanzen parallel starten.
[!] Nicht `next start` manuell starten, solange PM2 bereits `wellfit-now` verwaltet.

---

## Status

[OPEN] Live 500 gemeldet.
[WAITING] Server-Logs erforderlich.
