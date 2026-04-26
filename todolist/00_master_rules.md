# WELLFIT – Master-Regeln & Roadmap-Prinzipien

Version: 3.1 – Split Roadmap / Version 2.8 + aktueller Mobile-Buddy-Vision-AR-Stand
Status: Aktive Produktumsetzung / Entwickler- und KI-Arbeitsgrundlage
Repository: Bernds-tech/WellFit-now
Ordner: todolist/

---

## 1. Nicht-löschen-Regel / Master-Listen-Regel

[!] Diese To-do-Liste darf niemals kleiner werden.
[!] Es dürfen keine bestehenden Aufgaben, Ideen, Epics, Businessplan-Punkte oder Architekturentscheidungen gelöscht werden.
[!] Erledigte Punkte bleiben sichtbar und werden auf [x] gesetzt.
[!] Verschobene Punkte bleiben sichtbar und werden auf [>] gesetzt.
[!] Blockierte Punkte bleiben sichtbar und werden auf [!] gesetzt.
[!] Wenn Inhalte zusammengeführt werden, muss der Inhalt erhalten bleiben.
[!] Neue Erkenntnisse werden ergänzt, nicht ersetzt.
[!] Die Reihenfolge darf geändert werden, aber der Inhalt muss erhalten bleiben.
[!] Kein produktrelevanter Punkt darf nur im Chat stehen bleiben.
[!] Bei jeder neuen Umsetzung muss diese Datei beziehungsweise der todolist-Ordner aktualisiert werden.

---

## 2. Statussystem

```txt
[ ] Offen
[x] Fertig
[~] In Arbeit
[!] Blockiert / kritisch
[>] Später / Backlog
```

---

## 3. Sichere Server-Deployment-Reihenfolge – aktuell

```bash
cd /var/www/WellFit-now
pm2 stop wellfit-now
git fetch origin
git reset --hard origin/main
npm install --no-audit --no-fund
NODE_OPTIONS="--max-old-space-size=768" npm run build
pm2 restart wellfit-now --update-env
pm2 status
```

Hinweis:
[!] Nicht blind `npm audit fix --force` ausführen.
[!] npm optional dependency Meldungen für fremde Plattformen sind auf Linux erwartbar, solange npm mit Exit 0 beendet.

---

## 4. Strategische Grundentscheidungen

[x] Alle Missionen sollen perspektivisch über AR laufen.
[x] Schritte zählen nicht mehr als Kernmission.
[>] Schritt-/Health-/Watch-Daten können später als unterstützende Validierungs-, Kontext- oder Plausibilitätsdaten dienen, aber nicht als Hauptmechanik.
[x] Tagesmissionen bleiben aktuell technischer Prototyp für Game Loop, Reward, Streak, XP und UI.
[!] Missionen egal ob Tagesmissionen, Wochenmissionen, Abenteuer, Challenge oder Wettkämpfe werden erst später inhaltlich breit ausgebaut.
[!] Vor dem weiteren Missionsausbau werden zuerst große Dateien sauber modularisiert beziehungsweise kritische Mobile-/Buddy-/Vision-Basis stabilisiert.
[x] Keine echte Token-Ausschüttung vor Testphase mit ca. 2.000–3.000 Testern.
[x] Aktuell alles über interne Punkte und XP abbilden.
[x] Punkte-System so halten, dass Token/WFT später austauschbar oder ergänzbar sind.
[x] Mobile App bleibt store-safe: keine Token-, Presale-, Trading- oder Mining-Funktionen in App-Store-kritischen Bereichen.
[x] Web-/Desktop-Dashboard bleibt Steuerzentrale für Marktplatz, Leaderboard, Punkte-Shop, Analytics und spätere Web3-Funktionen.
[x] Mobile App bleibt täglicher Begleiter: Missionen, Buddy, Kameraanalyse, Bewegungstest, AR, wenige Einstellungen.

---

## 5. Sicherheit als oberste Architekturregel

[!] Keine manipulierbare Client-Logik als finale Autorität für Punkte, Einsätze, Jackpot, Burn, Tracking, Wettbewerbe oder Anti-Cheat.
[!] Frontend darf in der Testphase schreiben, aber finale Produktlogik muss später serverseitig validiert werden.
[!] Mission-Buddy-Bridge, Rewards und Tracking müssen langfristig über Cloud Functions / Backend-Regeln / Firestore Rules gehärtet werden.
[!] Kamera, Pose Tracking, Face Tracking, Mimiksignale, Health-Daten und Watch-Daten brauchen klare Zustimmung.
[!] Rohbilder und Videos werden nicht standardmäßig gespeichert.
[!] Keine medizinischen oder psychologischen Diagnosen.

---

## 6. Hinweis zu Version 2.1 bis 2.8

Version 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 und 2.8 bleiben inhaltlich gültig.

Diese Split-Roadmap ersetzt keine früheren Inhalte durch Kürzung. Sie führt zusammen, aktualisiert Status und macht die Roadmap wartbarer.
