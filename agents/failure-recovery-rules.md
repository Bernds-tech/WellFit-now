# WellFit Agent Failure Recovery Rules

## Zweck

Wenn ein Agent eine Aenderung nicht ausfuehren kann, darf die Aufgabe nicht im Chat verloren gehen.

Diese Datei definiert, wie blockierte, zu grosse, abgelehnte oder fehlgeschlagene Aenderungen dauerhaft dokumentiert und erneut aufgreifbar gemacht werden.

## Grundregel

Wenn eine Aenderung nicht ausgefuehrt werden konnte, muss der Agent mindestens eine der folgenden Spuren hinterlassen:

1. Kommentar im bestehenden Issue oder Pull Request
2. Eintrag in `project-register/progress-log.json`
3. Eintrag in `project-register/todos.json`
4. Eintrag in `project-register/decisions.json`, falls eine Entscheidung noetig ist
5. kleine Pending-Fix-Datei unter `project-register/pending-fixes/`, wenn eine Datei zu gross oder ein Tool blockiert ist

## Tool-blockiert-Regel

Wenn ein Tool eine Aenderung blockiert, z. B. durch:

- Datei zu lang
- Vollersatz abgelehnt
- Sicherheitsblock
- fehlende Berechtigung
- Merge-/Branch-Konflikt
- API-/Connector-Limit

muss der Agent:

1. die Ursache benennen,
2. die betroffene Datei nennen,
3. den exakten gewuenschten Patch oder Einfuegetext dokumentieren,
4. eine kleinere Alternative vorschlagen,
5. einen offenen Todo-/Progress-Eintrag anlegen oder kommentieren,
6. nicht behaupten, die Aenderung sei erledigt.

## Split-Change-Regel

Wenn eine Datei zu gross fuer eine sichere Aenderung ist:

1. Nicht die gesamte Datei riskant ersetzen.
2. Aenderung in kleinere Schritte teilen.
3. Falls moeglich, neue kleinere fuehrende Dateien anlegen.
4. Alte Datei nur noch referenzieren, wenn direkter Patch sicher moeglich ist.
5. Fehlenden Patch als Pending Fix dokumentieren.

## Pending-Fix-Dateien

Pfad:

```txt
project-register/pending-fixes/
```

Namensschema:

```txt
YYYY-MM-DD-short-topic.json
```

Pflichtfelder:

- id
- date
- status
- blockedToolOrReason
- targetFile
- desiredChange
- exactPatchText
- nextAction
- relatedIssueOrPr

## Stufe-4-Regel

Bei Stufe 4 darf ein blockierter Schritt nicht einfach uebersprungen werden.

Der Agent muss den Blocker dokumentieren und den naechsten konkreten Schritt liefern.

## Abschlussregel

Eine Aufgabe gilt nicht als erledigt, wenn:

- eine gewuenschte Datei nicht geaendert wurde,
- ein Quality Gate weiter fehlschlaegt,
- ein Blocker nicht dokumentiert wurde,
- ein lokaler manueller Schritt offen ist.
