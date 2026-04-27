# WellFitBuddyAR – Muss-Kriterien

Stand: 2026-04-27

## Ziel

Der WellFit-Buddy soll nicht als 2D-Overlay wirken, sondern als glaubwürdiger 3D-Begleiter in der realen Umgebung.

## Muss-Kriterien v1–v3

### World Tracking

- [ ] Buddy bleibt an realer Weltposition, wenn das Handy geschwenkt wird.
- [ ] Buddy ist an einem AR Anchor gebunden, nicht an eine Bildschirmposition.
- [ ] Buddy kann neu gerufen und an einem neuen Anchor platziert werden.

### Plane Detection / Surface Placement

- [ ] Buddy kann auf Boden stehen.
- [ ] Buddy kann auf Tischflächen stehen.
- [ ] Buddy kann auf Couch-/Sitzflächen stehen, sofern ARCore/ARKit sie als horizontale Flächen erkennt.
- [ ] Buddy kann auf Kastl oder anderen erkannten horizontalen Flächen stehen.
- [ ] Erkannte Flächen werden intern als Surface Nodes verwaltet.

### Navigation / Movement

- [ ] Buddy kann in kleinem Radius um seinen Anchor laufen.
- [ ] Buddy kann zu einem nahen Surface Node gehen.
- [ ] Buddy kann von einer höheren Fläche herunter springen.
- [ ] Buddy kann auf eine höhere Fläche springen.
- [ ] Buddy kann später klettern, balancieren oder sich an Höhenunterschiede anpassen.

### Camera / User Awareness

- [ ] Buddy schaut zur Kamera beziehungsweise zum Nutzer.
- [ ] Buddy richtet sich weich aus, nicht ruckartig.
- [ ] Buddy kann auf Orte, Hinweise oder Objekte in der Umgebung aufmerksam machen.

### Visual Believability

- [ ] Buddy nutzt realistische Skalierung.
- [ ] Buddy passt perspektivisch zur AR Camera.
- [ ] Buddy bekommt einen einfachen Schatten oder Blob Shadow.
- [ ] Occlusion wird später über AR Occlusion Manager geprüft.

### Abilities / Ausrüstung

- [ ] Buddy kann Fähigkeiten abhängig von Ausrüstung einsetzen.
- [ ] Beispiele: klettern, springen, holen, scannen, markieren, tragen.
- [ ] Unity visualisiert Fähigkeiten nur; Backend entscheidet, ob Item/Fähigkeit gültig ist.

## Nicht ausreichend

- [!] 2D-Bild über Kamera.
- [!] Emoji über Kamera.
- [!] 3D-Objekt, das am Display klebt.
- [!] Simulierter Anker ohne World Tracking.
- [!] Bewegung nur von Bildschirmposition zu Bildschirmposition.
- [!] Ausrüstung nur als kosmetisches Bild ohne Gameplay-Funktion.

## Sicherheitsgrenze

Unity darf keine Rewards, XP, Punkte, Token, Jackpot, Burn, Leaderboard-Wertungen oder Mission Completion autorisieren.

Unity meldet nur AR-Ereignisse:

- Buddy platziert
- Anchor erstellt
- Fläche erkannt
- Buddy-Aktion gestartet
- Buddy-Aktion beendet
- Buddy hat Ziel erreicht
- Nutzerinteraktion erkannt

Backend/App entscheidet:

- Mission gültig
- Item gültig
- Fähigkeit gültig
- Completion gültig
- XP/Punkte intern gültig
- Anti-Cheat gültig
