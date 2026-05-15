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


## Register/User/Profile/Settings Schema-Baseline (Dokumentation, 2026-05-15)

Status: `documentation_only`. Diese Baseline dokumentiert bestehende Annahmen aus Sprint-/Planungsdateien und ist **keine** Freigabe fuer Runtime-Aenderungen, neue Firestore-Writes, Auth-Logik, Settings-Logik oder Profilmigrationen. Unklare Felder bleiben `review_required`, bis sie gegen die vorhandene Registrierung, Einstellungen, Firestore Rules und Datenschutzanforderungen geprueft wurden.

### Scope und bestehende Quellen

- Fuehrender Sprint-Kontext: `WF-REGISTER-001` und `WF-REGISTER-SCHEMA-001` in `todolist/B - AKTUELLER SPRINT-STAND – LOGIN - REGISTRIERUNG - DEPLOYMENT`.
- Fuehrender Datenmodell-Kontext: Abschnitte `Nutzer`, `Profile und Gesundheitseinstellungen`, `KI-Buddy`, `Gamification`, `Wallet Demo` und `Audit und Logs` in dieser Datei.
- Fuehrende Guardrails: keine sensiblen Daten unstrukturiert speichern, Health-/Kinder-/Standortdaten besonders schuetzen, keine Client-Autoritaet fuer Punkte, XP, Rewards, Mission Completion, Leaderboards oder Anti-Cheat.
- Diese Dokumentation erfindet keine neuen Produktfunktionen; sie benennt nur Feldkandidaten, Datenschutzgrenzen und Review-Risiken.

### Registrierungsfelder (bestehende Annahmen)

| Feld / Feldgruppe | Aktuelle Annahme | Sensitivitaet / Zweck | Status |
|---|---|---|---|
| `email` / Login-Provider | Fuer Auth/Login erforderlich; E-Mail wird laut Sprint validiert und normalisiert. | Personenbezogen, Auth-sensitiv; nicht fuer KI-Kontext, Rewards oder Profilentscheidungen verwenden. | bestehende Annahme / review_required fuer genaue Speicherung |
| `password` / Passwortbestaetigung | Nur Eingabe-/Firebase-Auth-Kontext; Passwortstaerke und Bestaetigung werden laut Sprint geprueft. | Hochsensitiv; darf nie als Firestore-Profilfeld dokumentiert oder gespeichert werden. | verboten als Datenmodellfeld |
| `name` oder `nickname` | Nutzerbereich nennt `name oder nickname`. | Personenbezogen; Anzeigename moeglich, KI nur als freundlicher Anredekontext, nicht als Entscheidungskriterium. | review_required |
| `birthDate`, `alter` oder `altersgruppe` | Geburtsdatum wird laut Sprint geprueft; Datenplan nennt Alter/Altersgruppe. | Sensitiv wegen Minderjaehrigen-/Guardian-Grenzen; fuer KI nur datensparsam als Altersgruppe statt exaktem Datum verwenden. | review_required |
| `language` / `sprache` | Nutzerbereich nennt Sprache. | Niedrig bis mittel; darf fuer UI-/Buddy-Sprache genutzt werden. | bestehende Annahme |
| `role` / `rolle` | Nutzerbereich nennt Rolle. | Berechtigungsrelevant; keine Client-Autoritaet ableiten. | review_required |
| `onboardingStatus` | Nutzerbereich nennt Onboarding-Status. | Niedrig bis mittel; steuert UI-Fortschritt, nicht Rewards. | bestehende Annahme |
| `createdAt`, `updatedAt`, `lastLoginAt` | Datenplan nennt Created/Updated; Login-Sprint nennt `lastLoginAt` und `updatedAt`. | Audit-/Account-Metadaten; keine medizinische, rechtliche oder Reward-Entscheidung. | bestehende Annahme |

### User-Dokument-Felder (Planungsbaseline)

| Feld / Bereich | Aktuelle Annahme | Grenzen |
|---|---|---|
| `user_id` / Auth-UID | Primaerer Join-Key zwischen Auth, Profil, Fortschritt, Buddy und Audit. | Keine zweite Nutzer-ID-Schicht ohne Migrationsplan; keine Secrets im Dokument. |
| `email` oder `loginProvider` | Auth-/Kontakt-/Login-Kontext. | Nicht in KI-Prompts geben; nicht fuer Leaderboard, Rewards oder Segmentierung ohne Review nutzen. |
| `role` | Moegliche Nutzerrolle. | Review erforderlich, weil Rollen Berechtigungen beeinflussen koennen. |
| `avatar` | Wird laut Sprint zusammen mit `profile.aiBuddy` bei Buddy-Auswahl gesetzt. | Doppelfeld-Risiko zu `profile.aiBuddy`; Quelle der Wahrheit klaeren. |
| `profile` | Container fuer Aktivitaets-, Ziel-, Interessen-, Buddy- und ggf. Health-Personalisierungsfelder. | Profilfelder koennen sensibel sein; nur minimal speichern und Consent beachten. |
| `settings` | Erwarteter Container fuer Einstellungen/Preferences. | Settings-Schema ist noch zu dokumentieren/gegen Einstellungen abzugleichen; keine Runtime-Aenderung in diesem Task. |
| `consent` | Laut Sprint gespeichertes Consent-Objekt. | Consent-Felder sind compliance-sensitiv; keine stillen Defaults ausser dokumentierter False-Default. |
| `permissions` | Laut Sprint standardmaessig `false`. | Nicht als echte OS-/Browser-Berechtigung missverstehen; genaue Feldnamen review_required. |
| `xp`, `level`, `badges`, `streaks`, `leaderboard_position` | Gamification-Bereich nennt diese Felder. | Duerfen nicht clientseitige finale Autoritaet sein; Server-/Backend-Review fuer echte Writes erforderlich. |
| `demo_balance`, `demo_transactions`, `wallet_status` | Wallet-Demo-Bereich nennt Demo-Felder. | Nur Demo/Mockup bis Freigabe; keine echten Token, Wallets, Transfers, Zahlungen oder Trading-Funktionen. |

### Profilfelder und KI-relevante Felder

| Feld / Feldgruppe | KI-relevant? | Sensitivitaet | Status / Grenze |
|---|---:|---|---|
| `fitnesslevel` / Aktivitaetslevel | ja | Gesundheitsnah / Selbstauskunft | `review_required`; nur fuer Vorschlaege, nie medizinische Bewertung oder Reward-Autoritaet. |
| `goals` / `zielsetzung` | ja | Mittel; kann gesundheitsnah sein | Bestehende Annahme; Buddy darf motivieren, nicht diagnostizieren. |
| `interests` / Interessen | ja | Niedrig bis mittel | Bestehende Annahme fuer Personalisierung; keine manipulative Segmentierung. |
| `preferredMissions` / bevorzugte Missionen | ja | Niedrig bis mittel | Nur Empfehlung/Sortierung; keine Completion- oder Reward-Entscheidung. |
| `preferredActivities` / bevorzugte Aktivitaeten | ja | Mittel; bewegungsbezogen | Laut Sprint in Step 3; `review_required` fuer genaue Feldnamen. |
| `sleep`, `nutrition`, `movement` | ja | Gesundheitsnah | Mapping-Bugs wurden laut Sprint korrigiert; genaue Felder `review_required`, keine medizinische Entscheidung. |
| `stress` | ja | Gesundheits-/Mental-Health-nah | Nur als unbestaetigter Feldkandidat aus KI-relevanter Sprint-Notiz; `review_required`. |
| `limitations` / Einschraenkungen | ja | Hochsensitiv gesundheitsnah | Besonders schuetzen; keine Pflicht ohne klares Consent-/Fallback-Konzept. |
| `communityMode` | ja | Sozial-/Sichtbarkeitsrelevant | Laut Sprint in Step 3; Datenschutz-/Sichtbarkeitsgrenzen klaeren. |
| `startTamagotchi` | bedingt | Niedrig bis mittel | Laut Sprint in Step 3; genaue Semantik `review_required`. |
| `ageBand` / Altersgruppe | ja | Minderjaehrigen-/Guardian-sensitiv | Falls KI-Kontext noetig, Altersgruppe statt exaktem Geburtsdatum bevorzugen. |
| `language` | ja | Niedrig | Fuer UI-/Buddy-Sprache geeignet. |

### Settings-Felder (Planungsbaseline)

Settings sind im Sprint als Abgleichsziel genannt, aber noch nicht final dokumentiert. Bis zum Runtime-Abgleich gelten folgende Kategorien nur als Schema-Annahmen:

- `language` / Sprache: UI- und Buddy-Ausgabe; bestehende Annahme.
- `notifications` / Benachrichtigungen: `review_required`, weil Push/Marketing/Reminder getrennt werden muessen.
- `privacy` / Sichtbarkeit / Community-Modus: `review_required`, weil Profil-/Community-Sichtbarkeit personenbezogen ist.
- `permissions`: laut Sprint standardmaessig `false`; genaue Unterfelder fuer Sensor, Health, Kamera, Standort oder Marketing sind `review_required`.
- `accessibility` / Darstellung: moeglicher Settings-Bereich, aber in den gelesenen Planungsdateien nicht eindeutig belegt; `review_required`.
- Keine Settings duerfen Token-/Wallet-/Trading-/Payment-Funktionen, Reward-Autoritaet, Mission Completion oder medizinisch/rechtliche Entscheidungen aktivieren.

### Avatar- und `aiBuddy`-Felder

| Feld / Feldgruppe | Aktuelle Annahme | Duplicate-/Risiko-Hinweis |
|---|---|---|
| `avatar` | Laut Sprint wird Buddy-Auswahl in `avatar` gespeichert. | Moegliches Doppelfeld zu `profile.aiBuddy`; Quelle der Wahrheit klaeren. |
| `profile.aiBuddy` | Laut Sprint wird Buddy-Auswahl auch in `profile.aiBuddy` gespeichert. | Muss gegen `avatar`, Buddy-Katalog und finale Buddy-Assets abgeglichen werden. |
| `buddy_id`, `name`, `personality`, `level`, `lastRecommendation`, `learningHistory` | KI-Buddy-Bereich nennt diese Felder. | `learningHistory` kann personenbezogen/sensibel werden; keine Rohchats oder sensiblen Diagnosen speichern. |
| Buddy-Bilder / Asset-IDs | Sprint nennt fehlende finale Buddy-Bilder und Dateinamenvereinheitlichung. | Asset-Namen nicht mit Datenmodellquelle verwechseln; fehlende Assets nicht durch Runtime-Workaround in diesem Task reparieren. |

### Consent- und Berechtigungsfelder

Laut Sprint wird ein Consent-Objekt gespeichert mit:

- `terms`
- `privacy`
- `healthPersonalization`
- `sensorTracking`
- `marketingOptIn`
- `guardianRequired`

Planungsgrenzen:

- `terms` und `privacy` sind blockierende Registrierungseinwilligungen laut Sprint-Kontext; genaue Rechts-/Textversionen bleiben compliance-reviewpflichtig.
- `healthPersonalization` und `sensorTracking` sind sensitiv und duerfen nur mit ausdruecklichem Zweck, Datensparsamkeit, Fallback und Widerrufspfad genutzt werden.
- `marketingOptIn` darf nicht mit Pflicht-Consent vermischt werden.
- `guardianRequired` markiert Minderjaehrigen-/Elternmodus-Grenzen; es ersetzt keinen finalen Guardian-Consent-Workflow.
- `permissions` starten laut Sprint standardmaessig auf `false`; echte OS-/Browser-/Device-Berechtigungen sind separat zu pruefen.

### Duplicate-/Wrong-Field-Risiken

- `avatar` vs. `profile.aiBuddy` vs. `buddy_id`: Quelle der Wahrheit offen, `review_required`.
- `name` vs. `nickname`: Anzeigename und echter Name nicht vermischen, `review_required`.
- `birthDate` vs. `alter` vs. `altersgruppe` vs. `ageBand`: exakte Geburtsdaten minimieren; KI-Kontext bevorzugt Altersgruppe, `review_required`.
- `permissions` vs. `consent`: technische Berechtigung ist nicht dasselbe wie rechtliche Einwilligung, `review_required`.
- `fitnesslevel`, `limitations`, `sleep`, `nutrition`, `stress`, `movement`: gesundheitsnahe Profilfelder duerfen nicht als harte medizinische oder Reward-Entscheidungsbasis dienen.
- `xp`, `level`, `streaks`, `demo_balance`, `wallet_status`: Anzeige-/Preview-/Demo-Kontext darf nicht zur finalen Ledger-, Wallet- oder Reward-Autoritaet werden.
- `communityMode` vs. Privacy-/Visibility-Settings: soziale Sichtbarkeit braucht klare Defaults und Review.

### Felder, die nicht fuer Autoritaet oder sensible Entscheidungen genutzt werden duerfen

Ohne explizite spaetere Review- und Backend-/Rules-Freigabe duerfen folgende Felder **nicht** als finale Grundlage fuer Rewards, Punkte/XP, Mission Completion, Anti-Cheat, medizinische, rechtliche, Zahlungs-, Wallet-, Token-, NFT-, Betting- oder Trading-Entscheidungen genutzt werden:

- alle clientseitig erfassten Profil-/Settings-/Consent-Anzeigen,
- `fitnesslevel`, `limitations`, `sleep`, `nutrition`, `stress`, `movement`, `preferredActivities`,
- `ageBand`, `birthDate`, `guardianRequired`, `communityMode`,
- `avatar`, `profile.aiBuddy`, Buddy-Level, `learningHistory`, Buddy-Empfehlungen,
- `xp`, `level`, `badges`, `streaks`, `leaderboard_position`,
- `demo_balance`, `demo_transactions`, `wallet_status`.

Naechster sicherer Schritt: documentation-only Abgleich der Settings-/Profil-Feldnamen mit vorhandenen Einstellungen-/Registrierungsdateien in einem explizit freigegebenen Read-only-Code-Inspection-Task; keine Runtime-Aenderung, keine Firestore-Migration und keine Rules-Aenderung.

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
