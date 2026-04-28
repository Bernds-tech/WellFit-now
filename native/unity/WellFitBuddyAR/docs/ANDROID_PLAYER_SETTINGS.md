# WellFitBuddyAR – Android Player Settings

Stand: 2026-04-28

## Ziel

Diese Datei sammelt die Android-/Unity-Player-Settings fuer den ersten echten ARCore-Build.

Ziel:

```txt
Unity Build & Run
→ Android-Handy startet AR-App
→ Kamera-/ARCore-Session läuft
→ Plane Detection funktioniert
→ Buddy kann platziert und bewegt werden
```

---

## 1. Build Settings

```txt
File → Build Settings
```

- [ ] Platform: Android.
- [ ] Switch Platform ausführen.
- [ ] Szene `WellFitBuddyAR` in Build Scenes aufnehmen.
- [ ] Development Build aktivieren.
- [ ] Script Debugging optional aktivieren.
- [ ] Android-Handy per USB verbinden.
- [ ] Build And Run testen.

---

## 2. XR Plug-in Management

```txt
Edit → Project Settings → XR Plug-in Management
```

- [ ] XR Plug-in Management installiert.
- [ ] Android Tab öffnen.
- [ ] ARCore aktivieren.
- [ ] iOS/ARKit später separat aktivieren.

---

## 3. Package Manager

```txt
Window → Package Manager
```

Installieren:

- [ ] AR Foundation.
- [ ] ARCore XR Plugin.
- [ ] XR Plugin Management.
- [ ] ARKit XR Plugin optional/später.

---

## 4. Player Settings – Identification

```txt
Edit → Project Settings → Player → Android
```

Empfohlen fuer ersten Test:

```txt
Company Name: WellFit
Product Name: WellFitBuddyAR
Package Name: io.wellfit.buddyar
Version: 0.1.0
Bundle Version Code: 1
```

---

## 5. Player Settings – Other Settings

Wichtige Punkte:

- [ ] Scripting Backend: IL2CPP empfohlen fuer spaeter; Mono fuer schnellen Test moeglich.
- [ ] Target Architectures: ARM64 aktivieren.
- [ ] Minimum API Level passend fuer ARCore pruefen.
- [ ] Target API Level: Automatic Highest Installed oder aktuelle Android SDK.
- [ ] Internet Access: Auto oder Require, falls Backend spaeter genutzt wird.
- [ ] Auto Graphics API pruefen.

---

## 6. Permissions / AR Required

Pruefen:

- [ ] Kamera-Berechtigung wird im Build angefordert.
- [ ] ARCore wird als Voraussetzung oder optionaler Modus passend gesetzt.
- [ ] App startet nicht ohne Kamera-Erlaubnis.

Hinweis:

Der erste Prototyp darf ARCore als erforderlich behandeln. Spaeter braucht WellFit Fallback-Logik fuer nicht unterstützte Geräte.

---

## 7. Android-Gerät vorbereiten

Am Handy:

- [ ] Entwickleroptionen aktivieren.
- [ ] USB-Debugging aktivieren.
- [ ] Gerät entsperrt lassen.
- [ ] USB-Vertrauensdialog bestätigen.
- [ ] Genug Akku.
- [ ] ARCore-kompatibles Gerät verwenden.

---

## 8. Build-Test

Ablauf:

1. Handy verbinden.
2. Unity `Build And Run`.
3. App startet auf Handy.
4. Kamera-Berechtigung erlauben.
5. Umgebung langsam scannen.
6. Auf erkannte Fläche tippen.
7. Buddy erscheint.
8. Erneut tippen.
9. Buddy läuft oder springt.

---

## 9. Typische Android-Build-Probleme

### Gerät wird nicht erkannt

Pruefen:

```txt
USB-Debugging aktiv?
USB-Vertrauen bestätigt?
Richtiges USB-Kabel?
Android SDK installiert?
```

### Build scheitert wegen SDK/NDK/JDK

Pruefen:

```txt
Android Build Support installiert?
Android SDK & NDK Tools installiert?
OpenJDK installiert?
Unity Hub Module vollständig?
```

### App startet, aber AR nicht

Pruefen:

```txt
ARCore XR Plugin installiert?
XR Plug-in Management Android ARCore aktiviert?
ARCore-fähiges Handy?
Kamera-Berechtigung erlaubt?
```

### Keine Fläche erkannt

Pruefen:

```txt
Mehr Licht
Mehr Struktur auf Boden/Tisch
Handy langsam bewegen
Plane Visualizer aktivieren
```

---

## 10. Sicherheitsgrenze

Android-/Unity-AR darf nicht autorisieren:

```txt
Punkte
XP
Rewards
Token/WFT
Jackpot/Burn
Leaderboards
Mission Completion
```

Unity/Android meldet nur AR-Events. WellFit Backend/App entscheidet später ueber Gueltigkeit, Evidence, Anti-Cheat und interne Rewards.
