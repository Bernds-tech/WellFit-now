# WellFit – KI-Buddy 3-Phasen-Roadmap Addendum

Status: In To Do List.txt zu übernehmen
Kontext: WF-DASH-BUDDY-001 – Mein KI-Buddy Modul ausbauen
Ziel: Mein KI-Buddy wird in vielen kleinen, skalierbaren Dateien aufgebaut und später um Skeleton Tracking, Face Tracking, Übungszählung und Augmented Reality erweitert.

## Grundentscheidung

Der KI-Buddy ist kein reines Maskottchen, sondern ein lebendiger digitaler Begleiter mit Zuständen, Pflege, Konsequenzen, Bindung, Economy-Loop, Trainingserkennung und späterer AR-Präsenz im realen Raum.

Der Buddy darf Konsequenzen haben:
- Er kann müde werden.
- Er kann Pflege brauchen.
- Er kann Chaos machen.
- Er kann weglaufen.
- Er kann 1 bis 3 Tage weg sein.
- Er kann später von anderen Nutzern in AR gefunden werden.
- Er stirbt nicht endgültig, sondern öffnet eine Rückhol-, Pflege- oder Suchmechanik.

Keine endgültige clientseitige Autorität für Punkte, Rewards, Pflegezustand, Weglaufen, Rückholung, Inventory, Käufe oder Leaderboard-Wertungen.

## Architekturregel

Alles wird wie beim Dashboard in kleine Dateien aufgeteilt.

Geplante und teilweise umgesetzte Struktur für Phase 1:

```txt
app/buddy/page.tsx
app/buddy/types.ts
app/buddy/hooks/useBuddyState.ts
app/buddy/lib/buddyState.ts
app/buddy/lib/buddyEconomy.ts
app/buddy/lib/buddyCopy.ts
app/buddy/lib/buddyCare.ts
app/buddy/lib/buddyRecovery.ts
app/buddy/lib/buddyInventoryPreview.ts
app/buddy/components/BuddyPageHeader.tsx
app/buddy/components/BuddyMainGrid.tsx
app/buddy/components/BuddyHero.tsx
app/buddy/components/BuddyStats.tsx
app/buddy/components/BuddyActions.tsx
app/buddy/components/BuddyCarePanel.tsx
app/buddy/components/BuddyEvolution.tsx
app/buddy/components/BuddyStoryBox.tsx
app/buddy/components/BuddyHomePanel.tsx
app/buddy/components/BuddyRecoveryPanel.tsx
app/buddy/components/BuddyInventoryPreview.tsx
app/buddy/components/BuddyFutureModules.tsx
app/missionen/lib/missionBuddyBridge.ts
```

Geplante Struktur für Phase 2:

```txt
app/buddy/training/page.tsx
app/buddy/training/components/CameraPermissionPanel.tsx
app/buddy/training/components/CameraPreview.tsx
app/buddy/training/components/SkeletonOverlay.tsx
app/buddy/training/components/FaceStatusPanel.tsx
app/buddy/training/components/ExerciseCounterPanel.tsx
lib/vision/poseTracker.ts
lib/vision/faceTracker.ts
lib/vision/exerciseCounter.ts
lib/vision/exerciseRules.ts
lib/vision/visionTypes.ts
```

Geplante Struktur für Phase 3:

```txt
app/buddy/ar/page.tsx
app/buddy/ar/components/ARPermissionPanel.tsx
app/buddy/ar/components/ARScene.tsx
app/buddy/ar/components/ARBuddyStatus.tsx
app/buddy/ar/components/ARSearchPanel.tsx
lib/ar/arSession.ts
lib/ar/buddyPlacement.ts
lib/ar/buddyMovement.ts
lib/ar/arAnchors.ts
lib/ar/arTypes.ts
```

---

# PHASE 1 – Mein KI-Buddy MVP / Produktkern

## Task-ID: WF-BUDDY-P1-001
Status: [~] In Arbeit
Ziel: Mein KI-Buddy-Seite als eigenständige, hochwertige Produktseite bauen.

## Umsetzung

[x] Route angelegt: app/buddy/page.tsx.
[x] Sidebar-Link zu Mein KI-Buddy ergänzt.
[x] Layout an Dashboard-Stil angepasst: Sidebar, Farbwelt, Premium-Optik.
[x] Buddy-Hero gebaut: Name, Avatar, Level, Titel, Status, Stimmung.
[x] Buddy-Werte anzeigen: XP, Energie, Hunger, Stimmung, Sauberkeit, Bindung, Loyalität, Neugier.
[x] Buddy-Aktionen gebaut: Füttern, Pflegen, Spielen, Aufräumen, Rufen, Suchen.
[x] Buddy-Aktionslogik in useBuddyState ausgelagert.
[x] MVP-Firestore-Speicherung für Buddy-Aktionen vorbereitet.
[x] Buddy-Storybox gebaut: Tagesmodus, emotionale Beschreibung, kleine Ereignisse.
[x] Buddy-Evolution gebaut: Entwicklungspfad, nächste Stufe, Spezialfähigkeiten später.
[x] Buddy-Heimat vorbereitet: Drachenhorst.
[x] Weglauf-/Rückholmechanik visuell vorbereitet.
[x] Punkte-Ausgaben vorbereitet: Futter, Pflege, Spielzeug, Reinigungsset, Rückhol-Köder.
[x] Inventory-/Shop-Vorschau vorbereitet.
[x] Keine echte Token-/Krypto-Funktion eingebaut.
[x] Keine serverkritische Economy-Logik als endgültige Client-Wahrheit behandeln.
[ ] Mobile-Ansicht prüfen.
[ ] Build prüfen.
[ ] Firestore Rules für neue Buddy-Felder und missionBuddyEvents prüfen.

## Buddy-Zustände

```ts
type BuddyStatus =
  | "active"
  | "tired"
  | "needsCare"
  | "messy"
  | "ranAway"
  | "foundByOther"
  | "recovered";
```

## Buddy-Werte

```ts
type BuddyState = {
  name: string;
  level: number;
  xp: number;
  energy: number;
  hunger: number;
  mood: number;
  cleanliness: number;
  bond: number;
  loyalty: number;
  curiosity: number;
  status: BuddyStatus;
  dailyMode: string;
};
```

## Akzeptanzkriterien

[x] Seite existiert und ist erreichbar.
[x] Seite ist in kleine Komponenten aufgeteilt.
[x] Buddy wirkt lebendig und hochwertig.
[x] Nutzer erkennt sofort Zustand, Level, Bindung und nächste Aktion.
[x] Chaos-/Weglauf-/Rückholsystem ist vorbereitet.
[x] Punkteverbrauch ist nur MVP/Frontend vorbereitet und später serverseitig abzusichern.
[ ] Mobile-Layout final prüfen.
[ ] Build-Test ausführen.

---

# PHASE 1.1 – Missionen mit KI-Buddy verbinden

## Task-ID: WF-BUDDY-MISSION-LINK-001
Status: [x] MVP umgesetzt / später serverseitig absichern
Ziel: Tagesmissionen und Mein KI-Buddy dürfen nicht getrennte Systeme bleiben. Mission Completion soll Punkte, Buddy-Reaktion und Event-Log auslösen.

## Umsetzung

[x] Mission-Buddy-Bridge angelegt: app/missionen/lib/missionBuddyBridge.ts.
[x] Bridge nutzt Firestore Transaction auf users/{userId}.
[x] Mission Reward erhöht users.points.
[x] Buddy-Werte reagieren je nach Missionstyp: Energie, Hunger, Stimmung, Sauberkeit, Bindung, Loyalität, Neugier.
[x] Buddy status und dailyMode werden nach Effekt neu berechnet.
[x] Event-Log wird in missionBuddyEvents geschrieben.
[x] Tagesmission-Abschluss ruft applyMissionBuddyBridge auf.
[x] UI-Meldung zeigt, dass Flammi auf Missionsfortschritt reagiert.

## Missionstypen und Buddy-Effekt

[ ] Effekte später balancen.
[ ] Workout: Energie sinkt stärker, Stimmung/Bindung steigen.
[ ] Bewegung: Neugier und Stimmung steigen.
[ ] Ernährung: Hunger/Energie/Stimmung steigen.
[ ] Abenteuer: Neugier und Bindung steigen stark.
[ ] Community/Ruhe: Stimmung und Loyalität steigen.

## Sicherheit

[!] Aktuell MVP-clientseitig.
[!] Später Cloud Function / Backend als Autorität für Mission Completion, Reward, Punkte, XP, Buddy-Effekt, Anti-Cheat.
[!] Client darf langfristig nur Completion-/Tracking-Events senden.
[!] missionBuddyEvents später für Audit, Debugging, Anti-Cheat und Analytics nutzen.

## Mobile-Entscheidung

[x] Handy-App wird bewusst schlank gehalten.
[x] Handy-App Fokus: Missionen spielen, Buddy sehen/füttern, Nutzer analysieren, AR starten, wenige Einstellungen.
[x] PC-Web-Dashboard bleibt Steuerzentrale für Marktplatz, Leaderboard, Punkte-Shop, Analytics, Web3/Token später.

---

# PHASE 2 – Skeleton Tracking, Face Tracking, Übungszählung

## Task-ID: WF-BUDDY-P2-VISION-001
Status: [ ] Offen / Wichtig
Ziel: Der Buddy kann den Nutzer über die Kamera analysieren, Übungen mitzählen und Feedback geben.

## Umsetzung

[ ] Kamera-Modul mit expliziter Zustimmung bauen.
[ ] Kamera darf nicht automatisch starten.
[ ] Skeleton Tracking vorbereiten.
[ ] Face Tracking vorbereiten.
[ ] Übungszählung vorbereiten.
[ ] Erste Übung auswählen: Kniebeuge oder Liegestütz.
[ ] Gültige und ungültige Wiederholungen unterscheiden.
[ ] Buddy-Coach-Feedback anzeigen.
[ ] Tracking-Ergebnis als strukturierte Daten vorbereiten.
[ ] Keine Bilder/Videos standardmäßig speichern.
[ ] Keine medizinischen Diagnosen anzeigen.

## Tracking-Funktionen

[ ] Körperpunkte erkennen: Kopf, Schultern, Ellbogen, Hände, Hüfte, Knie, Füße.
[ ] Gelenkwinkel berechnen.
[ ] Wiederholungen zählen.
[ ] Saubere Bewegung validieren.
[ ] Schlechte Wiederholungen nicht zählen.
[ ] Face Tracking für Blickrichtung/Mimik vorbereiten.
[ ] Feedback neutral und motivierend formulieren.

## Beispiel-Datenmodell

```ts
type ExerciseRep = {
  exercise: "squat" | "pushup" | "jumpingJack" | "plank";
  validReps: number;
  invalidReps: number;
  confidence: number;
  feedback: string;
};
```

## Akzeptanzkriterien

[ ] Kamera-Start funktioniert nach Zustimmung.
[ ] Skeleton kann testweise angezeigt werden.
[ ] Gesicht kann testweise erkannt werden.
[ ] Mindestens eine Übung wird gezählt.
[ ] Buddy gibt Feedback.
[ ] Datenschutz- und Consent-Text ist vorbereitet.

## Sicherheit / Datenschutz

[!] Rohbilder und Videos werden nicht standardmäßig gespeichert.
[!] Kamera, Mimik, Face Tracking, Pose Tracking und Health-Daten benötigen Zustimmung.
[!] Kinder-/Familienmodus später gesondert absichern.
[!] Keine medizinische Diagnose oder psychologische Bewertung.

---

# PHASE 3 – AR-Buddy im realen Raum

## Task-ID: WF-BUDDY-P3-AR-001
Status: [ ] Offen / Später nach Phase 1 und 2
Ziel: Nutzer sieht den Buddy durch die Handykamera im echten Raum herumlaufen.

## Umsetzung

[ ] AR-Technikentscheidung treffen: WebAR-Prototyp vs. native App / Unity / ARKit / ARCore.
[ ] AR-Kamera nur nach Zustimmung starten.
[ ] Boden-/Flächenerkennung vorbereiten.
[ ] Buddy als 3D-Objekt vorbereiten.
[ ] Buddy auf realer Fläche platzieren.
[ ] Buddy im Raum laufen lassen.
[ ] Tap-/Interaktion vorbereiten.
[ ] Buddy kann sich verstecken oder Spuren hinterlassen.
[ ] Weglauf-/Rückholmechanik mit AR verbinden.
[ ] Training mit Buddy später mit Skeleton Tracking verbinden.

## AR-Verhalten

[ ] Buddy läuft im Raum herum.
[ ] Buddy schaut zum Nutzer.
[ ] Buddy reagiert auf Antippen.
[ ] Buddy kann sich freuen, schlafen, traurig sein, Chaos machen oder weglaufen.
[ ] Buddy kann Übungen vormachen.
[ ] Nutzer kann ihn in AR suchen.

## Akzeptanzkriterien

[ ] AR-Seite ist vorbereitet.
[ ] Buddy kann perspektivisch im echten Raum erscheinen.
[ ] AR-Suche ist als Mechanik vorgesehen.
[ ] 3D-/Animationsbedarf ist dokumentiert.
[ ] Integration mit Phase-2-Tracking ist vorbereitet.

---

# Neue Roadmap-Reihenfolge

PRIO 1:
[x] WF-BUDDY-MISSION-LINK-001 – Mission-Buddy-Bridge MVP umgesetzt.
[~] WF-BUDDY-P1-001 – Mein KI-Buddy MVP bauen.
[ ] Mobile-Layout / Build prüfen.

PRIO 2:
[ ] WF-BUDDY-P2-VISION-001 – Kamera, Skeleton Tracking, Face Tracking und Übungszählung vorbereiten.

PRIO 3:
[ ] WF-BUDDY-P3-AR-001 – AR-Buddy im realen Raum vorbereiten.

Danach:
[ ] Marktplatz MVP.
[ ] Leaderboard MVP.
[ ] Punkte-Shop MVP.
[ ] Analytics & Stats MVP.
[>] Missionen erst danach weiter inhaltlich ausbauen.

# Hinweis zur To Do List.txt

Dieses Addendum muss bei der nächsten sicheren Roadmap-Dateiaktualisierung in To Do List.txt übernommen werden. Ein direkter Schreibversuch auf To Do List.txt wurde durch einen GitHub-Blob-SHA-Konflikt blockiert, daher wird dieses Addendum vorerst als versionierte Roadmap-Ergänzung im Repository abgelegt.
