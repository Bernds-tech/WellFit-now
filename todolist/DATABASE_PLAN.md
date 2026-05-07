# DATABASE PLAN - WELLFIT

## Ziel
Die Datenbank darf nicht vergessen werden. WellFit braucht ein skalierbares Datenmodell fuer Beta, App, Missionen, Nutzer, KI-Buddy, Gamification und spaetere Token-/Wallet-Funktionen.

## Grundsatz
Zuerst sauber planen, dann implementieren. Keine sensiblen Daten unstrukturiert speichern.

## Wichtige Datenbereiche

### 1. Nutzer
- user_id
- name oder nickname
- email oder login-provider
- rolle
- alter oder altersgruppe
- sprache
- avatar
- onboarding-status
- created_at
- updated_at

### 2. Profile und Gesundheitseinstellungen
- user_id
- fitnesslevel
- interessen
- einschraenkungen
- bevorzugte missionen
- zielsetzung
- datenschutz-einwilligungen

Hinweis: Gesundheitsdaten sind sensibel und muessen besonders geschuetzt werden.

### 3. Missionen
- mission_id
- titel
- beschreibung
- typ
- schwierigkeit
- dauer
- punkte
- token-demo-belohnung
- altersgruppe
- status
- created_by
- created_at

### 4. Nutzerfortschritt
- progress_id
- user_id
- mission_id
- status
- startzeit
- endzeit
- punkte
- streak
- nachweisart

### 5. KI-Buddy
- buddy_id
- user_id
- name
- persoenlichkeit
- level
- letzte_empfehlung
- lernhistorie

### 6. Gamification
- user_id
- xp
- level
- badges
- streaks
- challenges
- leaderboard_position

### 7. Wallet Demo
- user_id
- demo_balance
- demo_transactions
- wallet_status

Wichtig: Bis zur echten Freigabe nur Demo/Mockup, keine echten Transfers.

### 8. Content und Kampagnen
- content_id
- typ
- zielgruppe
- text
- status
- kanal
- created_at

### 9. Audit und Logs
- event_id
- user_id
- event_type
- timestamp
- metadata

## Moegliche Datenbankoptionen
Noch offen. Zu pruefen:
- Supabase / PostgreSQL
- Firebase
- eigener PostgreSQL-Server
- Cloud-Datenbank
- spaetere Trennung von App-Daten und Analytics-Daten

## Beta-Fokus
Fuer die Beta zuerst noetig:
1. Nutzerprofil
2. Missionen
3. Fortschritt
4. Gamification-Punkte
5. KI-Buddy-Grunddaten
6. Demo-Wallet

## Offene Entscheidungen
- Welche Datenbank wird verwendet?
- Wo laeuft das Backend?
- Welche Authentifizierung wird genutzt?
- Welche Daten duerfen in der Beta gespeichert werden?
- Wie werden Kinder-/Jugenddaten geschuetzt?
- Wie werden Gesundheitsdaten rechtlich sauber behandelt?

## KI-Fortsetzungs-Prompt
Pruefe bei jeder neuen WellFit-Funktion, ob dafuer Datenbanktabellen oder Datenmodelle benoetigt werden. Erweitere diesen Plan, bevor Code geschrieben wird. Halte sensible Daten, Auth, Missionen, Fortschritt und Wallet strikt getrennt.
