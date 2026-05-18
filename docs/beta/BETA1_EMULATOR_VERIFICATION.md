# Beta-1 Emulator Verification

## Zweck

Dieses Dokument beschreibt die eng begrenzte Beta-1 Emulator-Verifikation fuer Firestore Rules und Firebase Callable Functions. Ziel ist echte, reproduzierbare CI-Ausfuehrung gegen lokale Firebase Emulatoren, nicht gegen echte Firebase-Ressourcen und nicht gegen Production-Projekte.

## Bekannte Codex-Blocker

- **Firestore Emulator JAR 403 Forbidden:** In vorherigen Codex-Laeufen konnte die Firebase CLI den Firestore Emulator (`cloud-firestore-emulator`) nicht herunterladen. Der Download endete mit `403 Forbidden`.
- **`ECONNREFUSED 127.0.0.1:8080`:** Nachdem der Firestore Emulator nicht gestartet war, konnten die Beta-1 Rules-Tests den lokalen Firestore Emulator nicht erreichen und brachen mit `ECONNREFUSED 127.0.0.1:8080` ab.
- Diese Fehler sind als Environment-Blocker zu behandeln, bis ein vorbereiteter lokaler Rechner oder GitHub Actions die Emulatoren tatsaechlich starten und die Tests ausfuehren kann.

## CI-Workflow-Beschreibung

Der Workflow `.github/workflows/beta1-emulator-tests.yml` heisst **Beta 1 Emulator Tests** und laeuft nur fuer `pull_request` und `workflow_dispatch`.

Der Workflow:

1. checkt das Repository aus,
2. richtet Node.js 20 passend zur Functions-Engine ein,
3. richtet Java 21 fuer Firebase Emulatoren ein,
4. installiert Root-Dependencies mit `npm ci`,
5. installiert Functions-Dependencies mit `npm --prefix functions ci`,
6. fuehrt statische Validierungschecks aus,
7. startet lokale Firebase Emulatoren mit `npx firebase emulators:exec --project demo-no-project --only auth,firestore,functions`,
8. fuehrt die Beta-1 Rules- und Callable-Tests gegen lokale Emulatoren aus.

Der Workflow enthaelt keinen Deploy-Schritt, keine Secrets und keinen Firebase Production Project ID. Firebase Tools werden ueber die bestehende Root-Dependency/devDependency per `npx firebase` genutzt.

## Ausgefuehrte Tests und Checks

Der CI-Workflow fuehrt aus:

```bash
npm run agent:validate
npm run agent:quality-gate
npm run lint
npm --prefix functions run check
npx firebase emulators:exec --project demo-no-project --only auth,firestore,functions "npm --prefix functions run beta1:rules && npm --prefix functions run beta1:callable"
```

Die fokussierten Beta-1 Tests innerhalb des Emulator-Exec sind:

```bash
npm --prefix functions run beta1:rules
npm --prefix functions run beta1:callable
```

Optional koennen in einem spaeteren Schritt oder bei stabiler Emulator-Laufzeit zusaetzlich ausgefuehrt werden:

```bash
npm --prefix functions run beta1:test:emulator
npm --prefix functions run test:emulator
```

## Ergebnisstatus

**Status: blockiert / CI zur echten Verifikation vorbereitet**

Lokal in der Codex-Umgebung wurden die nicht-emulatorbasierten Checks so weit wie moeglich ausgefuehrt. Die eigentliche Gruenmeldung fuer `beta1:rules` und `beta1:callable` darf erst erfolgen, wenn GitHub Actions oder eine vorbereitete lokale Umgebung die Firebase Emulatoren erfolgreich startet und die Tests ohne Environment-Blocker ausfuehrt.

Wenn GitHub Actions ebenfalls beim Firestore Emulator Download mit `403 Forbidden` scheitert, ist der Status weiterhin **blockiert**. In diesem Fall darf kein Fake-Erfolg gemeldet werden; der exakte Workflow-Log mit dem Firestore Emulator JAR Downloadfehler ist als naechste Evidenz zu dokumentieren.

## Firebase-Ressourcen, Secrets und Deploys

- Echte Firebase-Ressourcen genutzt: **nein**
- Firebase Production Project ID genutzt: **nein**
- Firebase Projekt im Workflow: **`demo-no-project`**
- Secrets genutzt: **nein**
- Deploys ausgefuehrt oder konfiguriert: **nein**

## Naechster empfohlener Schritt

Naechster empfohlener Branch: `ci/beta1-emulator-results-followup`

Nach dem Merge dieses Workflows sollte ein maintainerseitiger GitHub-Actions-Lauf geprueft werden. Falls der Workflow gruen ist, sollten die echten CI-Logs in den Projektregistern nachgetragen werden. Falls der Workflow durch den Firestore Emulator JAR Download mit `403 Forbidden` oder durch `ECONNREFUSED 127.0.0.1:8080` blockiert ist, sollte ein Follow-up nur die Emulator-Bereitstellung bzw. Cache-/Mirror-Strategie klaeren, weiterhin ohne Secrets, Deploys oder Production-Firebase-Zugriff.
