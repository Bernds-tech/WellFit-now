# WELLFIT – K: AR-BUDDY COMPANION UND AVATAR-GRUNDLOGIK

Status: Konsolidierte Arbeitsgrundlage
Kontext: Unity AR Foundation / ARCore / ARKit / KI-Buddy / Avatar-System
Ziel: Der Buddy wird vom platzierbaren AR-Objekt zum echten realraumfesten Begleiter mit Avatar-Entwicklung, Fähigkeiten, Rufen-/Folgen-Logik und sicherer Backend-Grenze.

---

## Quellen / Grundlagen

Diese Todo-Liste fasst folgende Arbeitsgrundlagen zusammen:

- `todolist/README.md`
- `todolist/J - NÄCHSTE EMPFOHLENE ARBEIT`
- `todolist/H1 - NATIVE AR - ARCORE - ARKIT - UNITY`
- `todolist/H2 - BUDDY ALS REALER AR-BEGLEITER UND KI-GUIDE`
- `todolist/ROADMAP_BUDDY_PHASES_ADDENDUM`
- `todolist/G1 - INTERNE PUNKTEOEKONOMIE VOR BLOCKCHAIN`
- `native/unity/WellFitBuddyAR/docs/BUDDY_AR_MUST_CRITERIA.md`
- `docs/architecture/TRACKING_BUDDY_SERVER_EVENTS.md`
- `docs/architecture/AI_DIMENSIONS_ITEMS_NFT_ECONOMY.md`
- Avatar-Quelle / Avatar-Unterlagen: Avatar-Entwicklung, Lebenslanges Avatar-System, Spiegel-Avatar, Persönlichkeits- und Spezialzustände

---

## 1. Bestätigter technischer Stand

[x] Unity 2022.3 LTS installiert und lauffähig.
[x] Android Build Support, SDK/NDK/OpenJDK eingerichtet.
[x] AR Foundation installiert.
[x] Google ARCore XR Plugin installiert.
[x] XR Plug-in Management eingerichtet.
[x] Android / ARCore Provider aktiviert.
[x] Android Build läuft auf echtem Samsung-Android-Handy.
[x] Kamera-Berechtigung wird abgefragt und funktioniert.
[x] Echte Kameraumgebung ist sichtbar.
[x] ARCore Plane Detection funktioniert.
[x] Raycast / Hit-Test auf reale Flächen funktioniert.
[x] Objekt kann auf realer Fläche platziert werden.
[x] Objekt bleibt raumfest an realer Position.
[x] Manuelle Bewegung zu weiteren Tap-Zielpunkten funktioniert.
[x] Companion-Test mit Ball/Buddy-Platzhalter funktioniert.
[x] Bewegung durch Garten / reale Umgebung erfolgreich getestet.
[ ] Funktionierende Unity-Szene als Sicherheitskopie sichern: `WellFitBuddyAR_WORKING_BALL_ANCHOR_TEST`.
[ ] Funktionierende Companion-Testszene zusätzlich sichern: `WellFitBuddyAR_WORKING_COMPANION_TEST`.

---

## 2. Verbindlicher Produktkern

Der WellFit-Buddy ist nicht nur ein Avatar, kein Menü-Button und kein dekoratives Maskottchen.

Er ist:

[x] persönlicher AR-Begleiter
[x] KI-Guide
[x] Missionsführer
[x] emotionaler Anker
[x] Avatar mit Entwicklung
[x] Träger von Fähigkeiten und Ausrüstung
[x] natürliche Interaktionsschicht zwischen Nutzer, App, Missionen und realem Raum

Der Buddy soll:

[ ] in der echten Umgebung sichtbar sein.
[ ] auf Boden, Tisch, Couch, Kastl oder anderen erkannten Flächen stehen können.
[ ] an realer Weltposition bleiben.
[ ] sich glaubwürdig im Raum bewegen.
[ ] nahe beim Nutzer bleiben.
[ ] per Button gerufen werden können.
[ ] später per Sprache gerufen werden können.
[ ] selbst kleine Bewegungen ausführen können.
[ ] Aufgaben und Missionen vorschlagen.
[ ] fehlende Ausrüstung erklären.
[ ] Hinweise in der realen Welt holen, scannen oder markieren.
[ ] Nutzer motivieren, aber nicht beschämen.
[ ] altersgerecht sprechen.
[ ] familien- und kindertauglich bleiben.

---

## 3. AR-Grundlogik

### 3.1 World Tracking

[x] Kamera-Pose wird über ARCore/AR Foundation verarbeitet.
[x] AR-Objekt bleibt beim Weg- und Zurückschwenken an realer Position.
[ ] World Tracking als Pflichtkriterium in Tests dokumentieren.
[ ] Testfall definieren: Nutzer platziert Buddy, bewegt Handy seitlich, Buddy bleibt auf Bodenstelle.
[ ] Testfall definieren: Nutzer schaut weg und zurück, Buddy bleibt an Ort.

### 3.2 Plane Detection / Surface Placement

[x] Bodenflächen werden erkannt.
[x] Tischflächen wurden als erkannte Flächen beobachtet.
[ ] Surface-Ziele klassifizieren: Boden, Tisch, Couch, Kastl, unbekannt.
[ ] Surface Nodes vorbereiten.
[ ] Flächen intern als `surfaceId` referenzieren.
[ ] Nur gültige Raycast-/Plane-Treffer als Ziel zulassen.
[ ] Ungültiges Ziel ablehnen und Buddy erklären lassen: „Zeig mir kurz eine klare Fläche.“

### 3.3 Raycast / Hit-Test

[x] Nutzer-Tap liefert reale Weltposition.
[x] Buddy/Ball kann zu Tap-Zielen laufen.
[ ] Raycast-Ziel mit Surface-Metadaten erweitern.
[ ] Raycast-Fehler sichtbar melden.
[ ] Raycast-Ziele später als AR-Events an App/Backend melden.

### 3.4 Anchor-System

[x] Objekt wird raumfest platziert.
[x] Objekt bleibt nach Weg-/Zurückbewegung stabil.
[ ] Anchor-Root und Visual-Root sauber trennen.
[ ] Buddy bei Zielerreichung neu re-anchorn.
[ ] Mehrere Zielpunkte als Verlauf speichern.
[ ] Alte Anchor sauber entfernen.
[ ] Anchor-Status als AR-Event melden.

---

## 4. Companion-Verhalten

### 4.1 Companion Radius

[ ] Test-Radius: 5 Meter.
[ ] Produkt-Radius: ca. 25 Meter.
[ ] Wenn Buddy weiter als Radius entfernt ist, sucht er Fläche nahe beim Nutzer.
[ ] Buddy läuft zur Nähe des Nutzers zurück.
[ ] Wenn keine Fläche nahe beim Nutzer erkannt wird: Buddy fordert Nutzer auf, Boden/Tisch zu zeigen.
[ ] Radius-Regel später abhängig von Mission, Alter, Ort und Sicherheitsmodus machen.

### 4.2 Buddy bleibt beim Nutzer

[ ] Buddy kann autonom kleine Bewegungen ausführen.
[ ] Buddy bleibt grundsätzlich in Nutzer-Nähe.
[ ] Buddy folgt nicht permanent klebend, sondern glaubwürdig.
[ ] Buddy darf Pausen machen.
[ ] Buddy darf neugierig kleine Ziele in der Nähe besuchen.
[ ] Buddy darf nicht aus dem Sicht-/Spielraum „verschwinden“, außer als bewusstes Spielereignis.

### 4.3 Ortswechsel

Wenn Nutzer das Handy einsteckt und zu einem anderen Ort fährt:

[ ] Alter AR-Anker wird nicht physisch weitergeführt.
[ ] Buddy-Zustand bleibt gespeichert.
[ ] Buddy-Level bleibt gespeichert.
[ ] Buddy-Ausrüstung bleibt gespeichert.
[ ] Buddy-Stimmung bleibt gespeichert.
[ ] Neue Umgebung wird beim nächsten AR-Start gescannt.
[ ] Buddy materialisiert sich wieder nahe beim Nutzer.
[ ] Später optionale Story: „Ich bin mitgereist.“

---

## 5. Rufen-Mechanik / Call Buddy

### 5.1 Button zuerst

[ ] Button „Buddy rufen“ einbauen.
[ ] Funktion `CallBuddyToUser()` definieren.
[ ] Fläche nahe beim Handy suchen.
[ ] Buddy läuft von aktueller Position zur Nutzer-Nähe.
[ ] Wenn Buddy zu weit weg ist: Rückkehr-Animation oder Materialisierung.
[ ] Wenn keine Fläche gefunden wird: „Zeig mir kurz den Boden.“

### 5.2 Sprache später

[ ] Sprachbefehl „Buddy, komm her“.
[ ] Sprachbefehl „Komm mit“.
[ ] Sprachbefehl „Warte“.
[ ] Sprachbefehl „Such einen Hinweis“.
[ ] Sprachbefehl „Zeig mir die Mission“.
[ ] Sprachbefehl wird nur Auslöser, nicht Autorität.
[ ] Gleiche CallBuddy-Funktion wie Button verwenden.
[ ] Sprache altersgerecht und optional.
[ ] Datenschutz/Consent für Sprache gesondert prüfen.

---

## 6. Bewegung und Navigation

### 6.1 Grundbewegung

[x] Bewegung zu Tap-Zielen funktioniert.
[ ] Drehung in Bewegungsrichtung weich machen.
[ ] Weiches Stoppen am Ziel.
[ ] Bewegungsgeschwindigkeit je Avatar-Typ definieren.
[ ] Zielerreichung als Event melden.
[ ] Bewegungen nicht ruckartig.
[ ] Keine Teleports außer bewusste Rückhol-/Materialisierungsmechanik.

### 6.2 Bewegungsgrenzen

[ ] Maximaler Einzelschritt definieren.
[ ] Wenn Ziel zu weit weg: in Etappen laufen.
[ ] Maximaler Höhenunterschied definieren.
[ ] Kleine Höhe: laufen.
[ ] Mittlere Höhe: springen.
[ ] Große Höhe: Fähigkeit nötig oder Ziel ablehnen.
[ ] Bewegung nur auf gültige erkannte Flächen.
[ ] Nicht ins Leere laufen.
[ ] Nicht durch nicht erkannte Raumzonen laufen.

### 6.3 Höhenlogik

[ ] Boden -> Tisch als Höhenwechsel erkennen.
[ ] Tisch -> Boden als Sprung/Heruntergehen erkennen.
[ ] Couch/Kastl als horizontale Surface Nodes behandeln.
[ ] Klettern erst mit Fähigkeit `climbUp`.
[ ] Springen erst mit Grundfähigkeit oder `jumpBoost`.
[ ] Landen animieren.
[ ] Unplausible Höhenziele ablehnen.

---

## 7. Hindernisse, Wände und Tische

### 7.1 Grundsatz

Buddy darf langfristig nicht durch reale Wände, Tische oder Möbel laufen.

### 7.2 Technische Stufen

Stufe 1:
[x] Nur zu gültigen Raycast-Flächen laufen.
[ ] Ziele ohne Plane-Hit ablehnen.
[ ] Bewegungslänge begrenzen.

Stufe 2:
[ ] Surface Nodes für Boden/Tisch/Couch/Kastl aufbauen.
[ ] Buddy bewegt sich nur zwischen erlaubten Surface Nodes.
[ ] Höhenwechsel mit Regeln versehen.

Stufe 3:
[ ] einfache Sperrzonen / No-Go-Zonen einführen.
[ ] Hindernis-Annäherung durch Depth prüfen.
[ ] Bewegung bei Hindernis abbrechen oder umlenken.

Stufe 4:
[ ] AR Occlusion Manager prüfen.
[ ] ARCore Depth API prüfen.
[ ] Tisch/Wand verdeckt Buddy optisch.
[ ] Buddy wird nicht mehr durch Objekte hindurch angezeigt.

Stufe 5:
[ ] Scene Mesh / Raumverständnis prüfen.
[ ] Pathfinding auf erkannter Umgebung prüfen.
[ ] echte Hindernisumgehung.

### 7.3 Produktverhalten bei Hindernis

[ ] Buddy sagt: „Da komme ich nicht durch.“
[ ] Buddy sucht Alternative.
[ ] Buddy fragt nach Fähigkeit/Item.
[ ] Buddy schlägt Umweg vor.
[ ] Buddy teleportiert nicht stillschweigend durch Möbel.

---

## 8. Avatar-Grundlogik aus Avatar-Quelle

### 8.1 Gemeinsame Grundlogik

Alle Avatare nutzen dieselbe Basis:

[ ] Placement
[ ] Anchor
[ ] Movement
[ ] Companion Radius
[ ] Call Buddy
[ ] Surface Navigation
[ ] Ability Use
[ ] AR Events
[ ] KI-Guide-Anbindung

### 8.2 Unterschiedliche Avatar-Typen

[ ] Hund
[ ] Drache
[ ] Mensch / Ritter / Held
[ ] Roboter / Cyborg
[ ] Katze / Tier
[ ] Magisches Wesen
[ ] Fantasiefigur
[ ] später weitere Typen

### 8.3 Avatar Profile

Jeder Avatar-Typ bekommt ein Profil:

[ ] AvatarType
[ ] Größe / Scale
[ ] Laufgeschwindigkeit
[ ] Bewegungsstil
[ ] Idle-Animation
[ ] Walk-Animation
[ ] Run-/Return-Animation
[ ] Jump-/Hop-Animation
[ ] Look-/React-Animation
[ ] erlaubte Fähigkeiten
[ ] Persönlichkeit
[ ] Stimme / Tonalität
[ ] Altersfreigabe / Kindertauglichkeit

Beispiele:

Hund:
[ ] läuft
[ ] schnuppert
[ ] wedelt
[ ] bleibt nahe
[ ] kann suchen

Drache:
[ ] läuft
[ ] hüpft
[ ] flattert
[ ] kann später höher springen/fliegen
[ ] kann Hinweise holen

Mensch/Ritter:
[ ] geht
[ ] joggt
[ ] winkt
[ ] kann Ausrüstung tragen
[ ] kann missionstypisch agieren

Roboter:
[ ] rollt/geht
[ ] scannt
[ ] piept
[ ] analysiert
[ ] zeigt Hinweise

---

## 9. Avatar-Entwicklung

Aus der Avatar-Quelle übernommen:

[ ] Nutzer wählt Avatar-Typ beim Start.
[ ] Avatar wächst durch Aktivität.
[ ] Avatar lernt neue Fähigkeiten.
[ ] Avatar schaltet Animationen frei.
[ ] Avatar verändert Aussehen durch Fortschritt.
[ ] Avatar bekommt digitale Ausrüstung.
[ ] Avatar bindet emotional an Nutzer.
[ ] Avatar entwickelt Persönlichkeit.

MVP-Umsetzung:
[ ] Level
[ ] XP
[ ] interne Punkte
[ ] sichtbare Entwicklungsstufen
[ ] freigeschaltete Animationen
[ ] freigeschaltete Fähigkeiten
[ ] Ausrüstung nur intern/visuell

Nicht im MVP:
[>] echte NFTs
[>] echter WFT
[>] NFT-Marktplatz
[>] Token-Trading
[>] Presale in Mobile
[>] echte Blockchain-Abhängigkeit

---

## 10. Lebenslanger Avatar / Langzeitvision

Aus der Avatar-Quelle als spätere Vision:

[ ] Avatar altert/entwickelt sich mit Nutzer.
[ ] Avatar-Tagebuch mit ausdrücklicher Zustimmung.
[ ] Avatar merkt sich Meilensteine.
[ ] Avatar kann frühere Orte/Missionen erinnern.
[ ] Avatar kann Generationen-/Erbe-System bekommen.
[ ] Avatar kann langfristige Fitnessreise spiegeln.
[ ] Avatar bleibt Teil des Nutzerlebens.

Sicherheitsgrenzen:
[!] keine medizinische Diagnose.
[!] keine psychologische Diagnose.
[!] keine heimliche Erinnerungslogik.
[!] sensible Daten nur mit Opt-in.
[!] keine Angst-/Scham-Mechanik.
[!] keine manipulative Drucksprache.

---

## 11. Avatar-Persönlichkeiten und Spezialzustände

### 11.1 MVP-Persönlichkeiten

[ ] neugierig
[ ] verspielt
[ ] mutig
[ ] ruhig
[ ] freundlich
[ ] witzig
[ ] mentorhaft
[ ] beschützend

### 11.2 Spätere Spezialmodi aus Avatar-Quelle

[>] Spiegel-Avatar
[>] flüchtiger Avatar
[>] unsichtbarer Avatar
[>] Metamorph-Avatar
[>] Stimmen-Avatar
[>] emotionaler Domino-Avatar
[>] zeitversetzter Avatar
[>] schlaue/eigensinnige Avatar-Variante
[>] Rätsel-in-sich-Avatar
[>] teleportierender Avatar als bewusstes Event
[>] schlafwandelnder Avatar

Regel:
[!] Spezialmodi sind Events/Story-Zustände, nicht Standardverhalten.
[!] Spezialmodi dürfen Nutzer nicht verwirren, verängstigen oder manipulieren.
[!] Kinder-/Familienmodus braucht klare, sichere Varianten.

---

## 12. Fähigkeiten / Items / Ausrüstung

### 12.1 Fähigkeiten

[ ] climbUp
[ ] jumpDown
[ ] jumpBoost
[ ] fetchClue
[ ] scanObject
[ ] revealHint
[ ] protect
[ ] carry
[ ] pointAtObject
[ ] returnToUser

### 12.2 Items

[ ] Lupe -> scanObject
[ ] Seil -> climbUp
[ ] Greifhaken -> fetchClue / climbUp
[ ] Rucksack -> carry
[ ] Schild -> protect
[ ] Laterne -> revealHint
[ ] Kompass -> navigation/hint
[ ] Kletterausrüstung -> jumpBoost/climbUp

### 12.3 Sicherheitsgrenze

[!] Unity visualisiert Fähigkeiten nur.
[!] Backend validiert Items/Fähigkeiten.
[!] Keine clientseitige Freischaltung produktkritischer Items.
[!] NFC-Tags sind reale Trigger, keine NFTs.
[!] NFC-Scan darf nicht direkt Reward oder Item final freischalten.
[!] Mobile zeigt keine Token-/NFT-/Trading-Funktion.

---

## 13. KI-Guide / Missionen / Rätsel

Der Buddy soll:

[ ] Menüs erklären.
[ ] Missionen vorschlagen.
[ ] Tagesmissionen empfehlen.
[ ] Wochenmissionen empfehlen.
[ ] Rätsel erklären.
[ ] Fortschritt kommentieren.
[ ] Hinweise geben.
[ ] fehlende Ausrüstung erklären.
[ ] faire Alternative anbieten.
[ ] altersgerecht sprechen.
[ ] Familien-/Kinderkontext berücksichtigen.
[ ] keine medizinischen Diagnosen geben.
[ ] keine harte Scham-/Drucksprache verwenden.

Beispiel:
[ ] „Da oben ist ein Hinweis.“
[ ] „Dafür brauche ich ein Kletterseil.“
[ ] „Wir können eines finden.“
[ ] „Zeig mir kurz den Boden.“
[ ] „Soll ich zu diesem Punkt laufen?“
[ ] „Wollen wir die nächste Mission starten?“

---

## 14. Backend-, Security- und Economy-Grenzen

### 14.1 Unity darf nur AR-Events melden

[ ] onArReady
[ ] onPlaneDetected
[ ] onAnchorCreated
[ ] onBuddyPlaced
[ ] onBuddyActionStarted
[ ] onBuddyActionCompleted
[ ] onBuddyReachedSurface
[ ] onBuddyActionRejected
[ ] onBuddyDialogueShown
[ ] onBuddyMissionSuggested
[ ] onBuddyCapabilityNeeded
[ ] onArError

### 14.2 Unity darf niemals autorisieren

[!] keine Punkte
[!] keine XP
[!] keine Rewards
[!] keine Mission Completion
[!] keine Token/WFT
[!] keine NFTs
[!] keine Jackpot-/Burn-Logik
[!] keine Leaderboards
[!] keine Anti-Cheat-Entscheidung

### 14.3 Backend entscheidet

[ ] Mission gültig
[ ] Evidence gültig
[ ] Item gültig
[ ] Fähigkeit gültig
[ ] Completion gültig
[ ] Reward gültig
[ ] XP/Punkte gültig
[ ] Anti-Cheat gültig
[ ] Economy Caps gültig
[ ] Parent-/Kinder-/Alterskontext gültig

---

## 15. App-Integration

[ ] Unity-Testszene in Repo sauber dokumentieren.
[ ] Native Bridge wieder anbinden.
[ ] WellFitNativeBridge mit Companion-Events erweitern.
[ ] AR-Events an App/Web-Schicht melden.
[ ] App kann Buddy rufen.
[ ] App kann Mission an Unity übergeben.
[ ] App kann Fähigkeit/Item-Status an Unity geben.
[ ] Backend-Events über Callable Functions schreiben.
[ ] Keine direkten Client-Writes in kritische Collections.

---

## 16. Aktuelle nächste Micro-Tasks

[ ] Funktionierende Szene `WellFitBuddyAR_WORKING_BALL_ANCHOR_TEST` sichern.
[ ] Funktionierende Companion-Szene `WellFitBuddyAR_WORKING_COMPANION_TEST` sichern.
[ ] SimpleARPlacementTest in saubere Controller aufteilen.
[ ] `BuddyPlacementController` erstellen.
[ ] `BuddyCompanionController` erstellen.
[ ] `BuddyMovementController` erstellen.
[ ] `BuddySurfaceTargetingController` erstellen.
[ ] `BuddyCallController` erstellen.
[ ] `BuddyAvatarProfile` Datenstruktur erstellen.
[ ] BuddyPlaceholder statt Ball als Standard-Prefab nutzen.
[ ] BuddyLookAt nur auf Visual/Head anwenden, nicht Root-Anker.
[ ] Companion-Radius als Feld einführen: Test 5 m, Produkt 25 m.
[ ] Button-/Command-Funktion `CallBuddyToUser()` vorbereiten.
[ ] Bewegungslimits einbauen: Distanz, Höhe, gültige Surface.
[ ] Debug-Overlay behalten, bis AR stabil ist.
[ ] Danach Debug-Overlay optional schaltbar machen.

---

## 17. Testfälle

### Testfall A – Raumfeste Platzierung

[ ] App starten.
[ ] Boden/Tisch scannen.
[ ] Tap 1 setzen.
[ ] Buddy erscheint.
[ ] Handy seitlich bewegen.
[ ] Buddy bleibt an realer Stelle.

### Testfall B – Manuelle Bewegung

[ ] Tap 2 auf gültige Fläche.
[ ] Buddy bewegt sich zum Ziel.
[ ] Buddy stoppt weich.
[ ] Buddy bleibt danach an neuer realer Stelle.

### Testfall C – Autonomes Wandern

[ ] Buddy steht.
[ ] Nutzer wartet.
[ ] Buddy sucht kleines Ziel in Nähe.
[ ] Buddy bewegt sich dorthin.
[ ] Buddy bleibt innerhalb Companion-Radius.

### Testfall D – Rückruf

[ ] Buddy steht entfernt.
[ ] Nutzer löst „Buddy rufen“ aus.
[ ] Buddy sucht Fläche nahe beim Handy.
[ ] Buddy läuft zurück oder materialisiert sich.
[ ] Buddy bleibt nahe beim Nutzer.

### Testfall E – Ortswechsel

[ ] App schließen.
[ ] Nutzer wechselt Ort.
[ ] App starten.
[ ] Neue Umgebung scannen.
[ ] Buddy erscheint nahe beim Nutzer.
[ ] Alter Zustand bleibt erhalten.

### Testfall F – Ungültiges Ziel

[ ] Nutzer tippt ins Leere.
[ ] Buddy bewegt sich nicht.
[ ] App meldet: keine gültige Fläche.
[ ] Buddy bittet um Boden/Tisch.

### Testfall G – Hindernis später

[ ] Tisch/Wand liegt zwischen Kamera und Buddy.
[ ] Occlusion/Depth später prüfen.
[ ] Buddy darf langfristig nicht durch Möbel laufen.

---

## 18. Statusbewertung

Aktueller Status:
[~] AR-Buddy Companion MVP in lokaler Unity-Testphase erfolgreich angelaufen.

Erreicht:
[x] Echter ARCore-Kameratest.
[x] Plane Detection.
[x] Raycast.
[x] Raumfeste Platzierung.
[x] Bewegung zu Tap-Zielen.
[x] Erste autonome Companion-Logik.

Noch offen:
[ ] Architektur sauber modularisieren.
[ ] Avatar-Quelle vollständig als Avatar Engine abbilden.
[ ] BuddyPlaceholder/echte Modelle verbessern.
[ ] Hindernis-/Occlusion-System planen.
[ ] Backend-/App-Bridge wieder anbinden.
[ ] Repo-Doku und Roadmap final aktualisieren.

## KI-Fortsetzungs-Prompt

Lies zuerst `todolist/MASTER_PROMPT_FOR_AI.md`, `todolist/TODO_INDEX.md`, `todolist/NEXT_ACTIONS.md` und die fuehrenden Dateien: `todolist/NEXT_ACTIONS.md`, `todolist/TODO_INDEX.md`, `todolist/PROJECT_STRUCTURE.md`.

Arbeite mit dieser Datei nur ergaenzend und nachvollziehbar. Loesche keine alten Aufgaben, Roadmap-Punkte, Statushinweise oder erledigten Eintraege. Markiere veraltete oder doppelte Punkte nur als `veraltet`, `duplikat`, `erledigt`, `offen` oder `zu pruefen`.

Wenn du offene Punkte aus dieser Datei uebernimmst, verlinke sie in `todolist/TODO_INDEX.md` oder uebertrage sie nach `todolist/NEXT_ACTIONS.md`. Dokumentiere erledigte Arbeit in `todolist/DONE_LOG.md`.

