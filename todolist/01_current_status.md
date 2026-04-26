# WellFit – Aktueller Umsetzungsstand

Status: Version 2.8 + aktueller Stand aus Mobile/Buddy/Vision/AR

---

## A. Vorhandene Hauptbereiche

[x] Dashboard existiert.
[x] Einstellungen existieren.
[x] Hilfe-Seite existiert.
[x] Tagesmissionen existieren.
[x] Wochenmissionen existieren.
[x] Abenteuer existieren.
[x] Challenge existiert.
[x] Wettkämpfe existieren.
[x] Favoriten existiert.
[x] History existiert.
[x] Rechtliche Seiten / Basislinks vorhanden: Datenschutz, AGB, Impressum, FAQ.
[x] Register-Seite vorhanden.
[x] Login-Seite vorhanden.
[x] Firebase Auth wird in Login, Register, Dashboard und Einstellungen verwendet.
[x] Dashboard nutzt onAuthStateChanged.
[x] Dashboard nutzt onSnapshot / Live Sync für Userdaten.
[x] Dashboard nutzt lokalen Cache als schnelle Anzeige.
[x] Dashboard schreibt Fortschritt über setDoc mit merge.
[x] Punkte, Schritte, Level und Avatarwerte bleiben über Firebase/Cache nach Reload erhalten.
[x] lastLoginAt / updatedAt werden aktualisiert.
[x] Einstellungen speichern viele Userdaten in Firestore.
[x] Logout im Dashboard funktional.
[x] Logout in Einstellungen funktional.
[x] Hilfe-Seite mit Rudi Rastlos / Mascottchen vorbereitet.
[x] Rudi Rastlos Datei: mascottchen.png.
[x] Hilfe-Seite wurde kompakter/animierter vorbereitet.
[x] Sidebar wurde auf Dashboard-Standard gebracht.
[x] App aufs Handy laden steht einzeilig.
[x] Hilfe ist auf den umgebauten App-Seiten als Link zu /hilfe gesetzt.
[x] Punkte-Shop statt Wallet in der MVP-Sidebar auf den umgebauten Seiten.
[x] App-Content wurde auf den Hauptseiten ca. 30 Prozent kompakter gemacht.
[x] Tagesmissionen laden Missionen dynamisch aus Firestore.
[x] Tagesmissionen nutzen Fallback-Missionen, wenn Firestore leer oder nicht erreichbar ist.
[x] Mission Completion Helper für Firestore existiert.
[x] History-Seite nutzt Firestore-Realtime via onSnapshot.
[x] userMissionProgress wird in Tagesmissionen live aus Firestore geladen.
[x] Tracking Session Helper für Firestore existiert.
[x] Browser-basierter Step Counter für Android-/PWA-nahe Tests vorbereitet.
[>] Schritte können technisch gezählt werden, sind aber nicht mehr Kernmission.
[x] Health Connect Vorbereitungsadapter / Architekturhinweis existiert.

---

## B. Build- und Deployment-Status

TASK-ID: WF-BUILD-VERIFY-001
STATUS: [~] In Arbeit / letzter bestätigter Build erfolgreich, erneuter Build nach letzten Mobile-Änderungen offen

[x] Deployment-Problem wurde stabilisiert: fetch/reset statt git pull.
[x] 2GB Swap wurde eingerichtet.
[x] npm install läuft.
[x] Next Build lief erfolgreich.
[x] PM2 Restart funktioniert.
[x] GitHub Actions Deployment wurde low-memory-sicherer gemacht.
[x] Build nach QR-/Motion-Erweiterung erfolgreich.
[x] /mobile/bewegung war im erfolgreichen Build enthalten.
[ ] Build nach folgenden späteren Änderungen erneut prüfen:
    - /mobile/einstellungen
    - /mobile/ar
    - /mobile/missionen/squat Buddy-Bridge
    - Scroll-Fixes
    - todolist Split-Struktur

---

## C. UI-Konsistenz / kompakter App-Standard

TASK-ID: WF-UI-001
STATUS: [x] Fertig

[x] Dashboard rechter Bereich kompakter.
[x] Dashboard Sidebar-Abstände korrigiert.
[x] Einstellungen rechter Bereich kompakter.
[x] Einstellungen Sidebar angeglichen.
[x] Hilfe-Seite ca. 30 Prozent kleiner.
[x] Tagesmissionen kompakter.
[x] Wochenmissionen kompakter.
[x] Abenteuer kompakter.
[x] Challenge kompakter.
[x] Wettkämpfe kompakter und inhaltlich neu strukturiert.
[x] Favoriten kompakter.
[x] History kompakter.
[x] Alle App-Seiten wirken wie ein einheitliches Produkt.
[x] Sidebar bleibt 250px breit.
[x] Hauptcontent ist dichter und professioneller.
[x] App aufs Handy laden ist einzeilig.
[x] Hilfe ist als Link eingebunden.

TASK-ID: WF-MISS-UI-001
STATUS: [x] Fertig

[x] Alle Missionsseiten optisch an Dashboard/Einstellungen angeglichen.
[x] Sidebar sieht auf allen App-Seiten gleich aus.
[x] Rechter Content ist ca. 30 Prozent kompakter.
[x] Hilfelink ist überall echter Link zu /hilfe.
[x] Keine Inhalte werden absichtlich abgeschnitten.

TASK-ID: WF-HELP-001
STATUS: [x] Fertig / Basis umgesetzt

[x] Hilfe-Seite vorhanden.
[x] Hilfe-Link in Sidebar eingebunden.
[x] Layout kompakter gemacht.
[x] Rudi Rastlos / Mascottchen als Hilfebegleiter vorgesehen.
[ ] Inhalte der Hilfe-Seite später fachlich erweitern.
[ ] FAQ-/Supportstruktur später verknüpfen.

TASK-ID: WF-HELP-002
STATUS: [~] In Arbeit

[x] Mascottchen-Dateiname festgelegt: mascottchen.png.
[x] Hilfeseite soll Rudi Rastlos nutzen.
[ ] Rudi später animieren: gehen, springen, winken, reagieren.
[ ] Später 3D/Avatar-Darstellung vorbereiten.
[ ] Später Interaktion mit KI-Buddy/Chat verbinden.

---

## D. Firebase / Realtime / Settings

TASK-ID: WF-DASH-004
STATUS: [x] Fertig / Basis-Realtime umgesetzt

[x] Dashboard nutzt Firebase Auth mit onAuthStateChanged.
[x] Dashboard nutzt lokalen Cache.
[x] Dashboard nutzt Firestore onSnapshot für Live-Synchronisation.
[x] Dashboard schreibt Fortschritt über setDoc mit merge.
[x] Punkte, Schritte, Level und Avatarwerte bleiben nach Reload erhalten.
[x] lastLoginAt / updatedAt werden beim Dashboard-Laden aktualisiert.
[x] Cache + Realtime werden kombiniert.
[x] Listener werden beim Verlassen sauber unsubscribed.
[ ] Realtime-Verhalten in Mehrtab-/Mehrgerät-Test noch manuell prüfen.

TASK-ID: WF-DASH-003
STATUS: [x] Fertig / Basis umgesetzt

[x] Dashboard nutzt Firebase signOut.
[x] Einstellungen nutzt Firebase signOut.
[x] Redirect auf Startseite nach Logout.
[ ] Logout auf allen Geräten später ergänzen.

TASK-ID: WF-SETTINGS-REALTIME-001
STATUS: [ ] Offen

[x] Einstellungen laden und speichern Userdaten in Firestore.
[ ] Einstellungen verwenden noch getDoc-basierte Lade-Logik.
[ ] Einstellungen sollen später onSnapshot nutzen.
[ ] getDoc in Einstellungen durch onSnapshot ergänzen/ersetzen.
[ ] Cache/Loading-State sauber kombinieren.
[ ] Listener sauber unsubscriben.
