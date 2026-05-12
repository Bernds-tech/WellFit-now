# Stufe 4 Self Check

Dieser Self Check ist vor jedem Stufe-4-Abschluss und vor jedem Stufe-4-Pull-Request auszufuehren.

## Ziel- und Kontextcheck

- [ ] Habe ich das Ziel des Nutzers vollstaendig verstanden?
- [ ] Habe ich geprueft, ob es sich um eine Stufe-4-Aufgabe handelt?
- [ ] Habe ich `agents/modes/stufe-4.md` gelesen?
- [ ] Habe ich die Source-of-Truth-Dateien gelesen?
- [ ] Habe ich bestehende Todos geprueft, bevor ich neue Aufgaben angelegt habe?

## Seiten- und API-Check

- [ ] Habe ich `project-register/routes.json` geprueft?
- [ ] Habe ich alle betroffenen Hauptseiten identifiziert?
- [ ] Habe ich alle relevanten Nebenseiten identifiziert?
- [ ] Habe ich betroffene API-Routen identifiziert?
- [ ] Habe ich Mobile-Web-Routen separat betrachtet?
- [ ] Habe ich geschuetzte App-Routen als solche markiert?

## Dokumentationscheck

- [ ] Habe ich `project-register/todos.json` aktualisiert oder begruendet, warum nicht?
- [ ] Habe ich `project-register/decisions.json` aktualisiert, falls eine Entscheidung offen ist?
- [ ] Habe ich `project-register/cross-references.json` aktualisiert?
- [ ] Habe ich `project-register/progress-log.json` aktualisiert?
- [ ] Habe ich relevante `todolist/*`-Dateien respektiert und nicht geloescht?

## Security Check

- [ ] Keine Secrets wurden veraendert oder offengelegt.
- [ ] Kein Production Deploy wurde ausgeloest.
- [ ] Keine echte Token-/NFT-/WFT-/Wallet-/Kauf-Funktion wurde aktiviert.
- [ ] Keine clientseitige Autoritaet fuer Punkte, XP, Rewards oder Mission Completion wurde eingefuehrt.
- [ ] Firebase-/Firestore-Regeln wurden nicht ohne Testplan verschaerft.

## Skalierbarkeitscheck

- [ ] Bestehende Module wurden erweitert statt Parallelmodule zu bauen.
- [ ] Neue Routen wurden in `routes.json` dokumentiert.
- [ ] Neue APIs wurden in `apis.json` dokumentiert.
- [ ] Neue Features wurden in `features.json` dokumentiert.
- [ ] Neue Abhaengigkeiten oder Datenfluesse wurden dokumentiert.
- [ ] Es wurde keine unkontrollierte globale Datenbankabfrage eingefuehrt.

## Test- und Quality-Check

- [ ] Build/Quality Gate wurde ausgefuehrt oder sauber als nicht ausfuehrbar dokumentiert.
- [ ] Fehler wurden gesammelt.
- [ ] Fehler wurden selbst korrigiert, sofern sicher moeglich.
- [ ] Tests wurden nach Korrektur wiederholt oder Blocker dokumentiert.
- [ ] Preview-/Testhinweise wurden dokumentiert.

## Abschlussentscheidung

Der Agent darf nur abschliessen, wenn alle zutreffenden Punkte erledigt sind oder ein echter Blocker dokumentiert wurde.
