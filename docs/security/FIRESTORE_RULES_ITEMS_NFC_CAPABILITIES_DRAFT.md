# Firestore Rules Draft - Items / NFC / Buddy Capabilities

## Ziel

Diese Datei ist ein Sicherheitsentwurf fuer spaetere Firestore Rules und Emulator-Tests.

Produktkritische Collections muessen serverautorisiert bleiben.

## Grundregeln

- Nutzer duerfen eigene Inventar- und Capability-Daten lesen.
- Nutzer duerfen keine Items, Capabilities, NFC-Tags oder Rewards direkt schreiben.
- Admin/Server/Cloud Functions schreiben produktkritische Daten.
- NFC-Tags sind nicht allgemein lesbar.
- ScanEvents sind Audit-Daten und werden serverseitig erzeugt.

## Pseudocode

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    function isServer() {
      // Platzhalter: spaeter Custom Claims/Admin SDK/Functions-Kontext definieren.
      return false;
    }

    match /itemDefinitions/{itemId} {
      allow read: if signedIn();
      allow write: if isServer();
    }

    match /userInventory/{inventoryItemId} {
      allow read: if signedIn() && resource.data.ownerUserId == request.auth.uid;
      allow create, update, delete: if isServer();
    }

    match /buddyCapabilities/{capabilityDocId} {
      allow read: if signedIn() && resource.data.userId == request.auth.uid;
      allow create, update, delete: if isServer();
    }

    match /nfcTags/{tagId} {
      allow read: if isServer();
      allow write: if isServer();
    }

    match /nfcScanEvents/{scanEventId} {
      allow read: if signedIn() && resource.data.userId == request.auth.uid;
      allow create, update, delete: if isServer();
    }

    match /capabilityUnlockEvents/{eventId} {
      allow read: if signedIn() && resource.data.userId == request.auth.uid;
      allow create, update, delete: if isServer();
    }
  }
}
```

## Wichtiger Hinweis

Firestore Rules koennen Admin SDK / Cloud Functions nicht direkt mit `isServer()` erkennen. Der echte Mechanismus muss spaeter sauber definiert werden:

- Cloud Functions nutzen Admin SDK und umgehen Rules.
- Clientseitige direkte Writes bleiben verboten.
- Admin-/Backoffice-Zugriffe muessen ueber Custom Claims oder gesonderte Admin-Tools laufen.

## Emulator-Testfaelle

- Nutzer liest eigenes Inventar: erlaubt.
- Nutzer liest fremdes Inventar: verboten.
- Nutzer erstellt eigenes Inventar-Item direkt: verboten.
- Nutzer aendert Item quantity direkt: verboten.
- Nutzer liest itemDefinitions: erlaubt, falls Shop/Inventar sichtbar.
- Nutzer liest nfcTags: verboten.
- Nutzer schreibt nfcScanEvents direkt: verboten.
- Cloud Function/Admin SDK schreibt ScanEvent: erlaubt ausserhalb Rules.
