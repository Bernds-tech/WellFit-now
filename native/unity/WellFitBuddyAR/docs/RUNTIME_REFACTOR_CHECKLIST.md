# WellFit Buddy – Runtime Refactor Checklist

Status: Checkliste fuer den Refactor nach erfolgreichem Unity-Retest
Branch: `wellfit/upload-local-unity-ar-buddy`
PR: #13

---

## Zweck

Diese Checkliste beschreibt, wie der spaetere Split von `BuddyCallDebugController.cs` in kleine Komponenten erfolgen soll.

Vor dem Retest bleibt dieses Dokument reine Planung.

---

## Vor dem Refactor pruefen

[ ] Unity Compile ist gruen.
[ ] Android Build startet.
[ ] Basis-AR funktioniert.
[ ] Buddy Placement funktioniert.
[ ] Buddy Movement funktioniert.
[ ] Debug-Seiten sind grob getestet.
[ ] Retest-Ergebnis ist dokumentiert.

Wenn einer dieser Punkte offen ist:

```txt
Noch nicht refaktorieren. Erst Testergebnis oder Fehlerbild klaeren.
```

---

## Refactor-Regeln

[!] Kleine Schritte.
[!] Eine Page oder Hilfskomponente pro Commit.
[!] Keine Product-UI im Debug-Refactor.
[!] Keine Backend-Logik im Debug-Refactor.
[!] Keine Economy-/Completion-Logik im Debug-Refactor.
[!] Keine Scene-YAML-Grosspatches.
[!] Prefab-Aenderungen erst nach Compile-Bestaetigung.

---

## Empfohlene Reihenfolge

1. `BuddyDebugContext`
2. `BuddyDebugStyle`
3. `BuddyDebugDiagnosticsPanel`
4. `BuddyDebugReturnPage`
5. `BuddyDebugVisualPage`
6. `BuddyDebugAbilityPage`
7. `BuddyDebugGuidePage`
8. `BuddyDebugOverlayRoot`
9. Bootstrap anpassen
10. alten Controller entfernen oder als Wrapper lassen

---

## Nach jedem Schritt pruefen

[ ] Unity Compile.
[ ] Szene startet.
[ ] Overlay sichtbar.
[ ] betroffene Page funktioniert.
[ ] keine neue NullReferenceException.
[ ] AR-/Buddy-Event-Grenze bleibt unveraendert.

---

## Referenz-Pruefung

Besonders pruefen bei fehlenden Referenzen:

```txt
bridge fehlt
anchorController fehlt
autoReturnController fehlt
buddy nicht platziert
abilityController fehlt
guideController fehlt
dialogueBridge fehlt
Camera.main fehlt
```

Erwartung:

```txt
sauberer Debug-Status oder Reject, kein Crash
```

---

## Unveraenderte Grenzen

Der Refactor darf keine neue Autoritaet einfuehren fuer:

```txt
Punkte
XP
Rewards
Mission Completion
Token/WFT
NFTs
Jackpot/Burn
Leaderboard
Anti-Cheat
Item- oder Faehigkeitsfreischaltung
```

---

## Rollback-Regel

Wenn ein Schritt mehrere neue Fehler erzeugt:

```txt
Schritt zuruecknehmen oder kleiner neu schneiden.
```

Nicht mehrere Folgefixes stapeln, bevor der Grundfehler verstanden ist.

---

## Commit-Regel

Gute Commit-Groessen:

```txt
refactor: add BuddyDebugContext
refactor: extract BuddyDebugDiagnosticsPanel
refactor: extract BuddyDebugReturnPage
```

Schlechte Commit-Groessen:

```txt
refactor everything
update unity stuff
big debug changes
```

---

## Akzeptanz fuer fertigen Split

[ ] Root ist klein.
[ ] Jede Page ist eigenstaendig.
[ ] DiagnosticsPanel ist getrennt.
[ ] Style ist zentral.
[ ] ControllerFinder reduziert Suche-Duplizierung.
[ ] Product-UI ist nicht vermischt.
[ ] Debug kann spaeter per Flag oder Szene deaktiviert werden.

---

## Status

[ ] Noch nicht anwenden vor Retest.
[x] Refactor-Reihenfolge definiert.
