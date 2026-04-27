# WellFitBuddyAR – Erster Android ARCore Build

Stand: 2026-04-27

## Ziel

Der erste Build soll nur pruefen, ob echtes AR auf dem Handy funktioniert.

Nicht Ziel des ersten Builds:

- finale Buddy-Grafik
- echte KI
- echte Rewards
- echte Mission Completion
- Store-Release

## Voraussetzungen

- [ ] Android-Handy mit ARCore-Unterstuetzung.
- [ ] USB-Kabel.
- [ ] USB-Debugging am Handy aktiviert.
- [ ] Unity Hub installiert.
- [ ] Unity 2022.3 LTS installiert.
- [ ] Android Build Support installiert.
- [ ] Android SDK & NDK Tools installiert.
- [ ] OpenJDK ueber Unity installiert.

## Unity Projekt

- [ ] Projektpfad: `native/unity/WellFitBuddyAR`.
- [ ] Szene: `WellFitBuddyAR`.
- [ ] Build Target: Android.
- [ ] AR Foundation installiert.
- [ ] ARCore XR Plugin installiert.
- [ ] XR Plugin Management installiert.
- [ ] Android XR Plugin: ARCore aktiviert.

## Szene Minimalaufbau

- [ ] AR Session.
- [ ] XR Origin.
- [ ] AR Camera.
- [ ] AR Plane Manager.
- [ ] AR Raycast Manager.
- [ ] AR Anchor Manager.
- [ ] Buddy Placeholder, zum Beispiel Capsule, kleiner Drache oder Cube.
- [ ] BuddyAnchorController an Scene Object.
- [ ] BuddyLookAtCamera am Buddy.
- [ ] WellFitNativeBridge an Scene Object.

## Erster Funktionstest

- [ ] App startet auf Handy.
- [ ] Kamera-Bild ist sichtbar.
- [ ] ARCore Session startet ohne Fehler.
- [ ] Horizontale Flächen werden erkannt.
- [ ] Nutzer tippt auf eine erkannte Fläche.
- [ ] Buddy Placeholder erscheint auf dieser Fläche.
- [ ] Buddy bleibt auf Weltposition, wenn das Handy geschwenkt wird.
- [ ] Buddy schaut zur Kamera.

## Erfolgskriterium

Der Build ist erfolgreich, wenn der Buddy nicht am Bildschirm klebt, sondern im Raum stehen bleibt.

## Fehlerbilder

### Kamera startet nicht

- Camera Permission prüfen.
- Android Manifest / Player Settings prüfen.
- Gerät neu verbinden.

### Keine Flächen erkannt

- Mehr Licht.
- Boden/Tisch mit Struktur scannen.
- Handy langsam bewegen.
- ARCore-Unterstützung des Geräts prüfen.

### Buddy klebt am Display

- Prüfen, ob AR Raycast auf PlaneWithinPolygon genutzt wird.
- Prüfen, ob AR Anchor erstellt wurde.
- Prüfen, ob Buddy unter Anchor transformiert ist.

### Build schlägt fehl

- Android SDK/NDK/JDK in Unity Hub prüfen.
- Build Target Android aktivieren.
- Unity 2022.3 LTS Version prüfen.

## Sicherheitsgrenze

Der Android-ARCore-Build darf nur AR-Ereignisse melden.

Keine Autorisierung von:

- Rewards
- XP
- Punkten
- Token/WFT
- Mission Completion
- Leaderboard
- Jackpot/Burn
