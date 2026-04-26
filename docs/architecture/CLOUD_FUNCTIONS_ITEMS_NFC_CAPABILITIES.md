# Cloud Functions - Items / NFC / Buddy Capabilities

## Grundsatz

Cloud Functions sind die Autoritaet fuer NFC, Item-Vergabe, Buddy-Faehigkeiten und Mission Completion mit Item-Bezug.

Client, PWA, Mobile und Unity duerfen keine produktkritischen Writes final ausfuehren.

## Functions

### validateNfcScan

Callable Function.

Input:

```ts
{
  publicCode: string,
  signedPayload?: string,
  missionId?: string,
  scannedAt: string,
  deviceId?: string,
  appSessionId?: string,
  approximateLocationHash?: string
}
```

Server-Kontext:

- auth.uid erforderlich

Pruefung:

1. Nutzer ist eingeloggt.
2. Tag mit publicCode existiert.
3. Tag ist active.
4. validFrom/validUntil gueltig.
5. usageLimit nicht ueberschritten.
6. Nutzer/Gruppe erlaubt, falls eingeschraenkt.
7. Mission passt, falls linkedMissionId gesetzt.
8. Kein offensichtlicher Duplicate-Scan im kurzen Zeitfenster.
9. Optional: signedPayload / rotatingSecret pruefen.
10. Optional: approximateLocationHash gegen Mission/Partner-Kontext plausibilisieren.

Writes:

- nfcScanEvents/{scanEventId}
- optional userInventory/{inventoryItemId}
- optional buddyCapabilities/{capabilityDocId}
- optional capabilityUnlockEvents/{eventId}
- nfcTags/{tagId}.usageCount increment

Output:

```ts
{
  accepted: boolean,
  scanEventId: string,
  tagId?: string,
  grantedItemId?: string,
  grantedCapabilityId?: string,
  message: string,
  rejectionReason?: string
}
```

### grantItemOrCapability

Callable oder internal function.

Nur Admin/Server oder trusted flow.

Input:

```ts
{
  userId: string,
  buddyId?: string,
  itemId?: string,
  capabilityId?: string,
  source: "mission" | "shop" | "nfc" | "partner" | "event" | "admin",
  sourceEventId?: string
}
```

Pruefung:

- Item/Capability existiert.
- User existiert.
- Source ist erlaubt.
- Kein Duplikat bei non-stackable Item.

Writes:

- userInventory
- buddyCapabilities
- capabilityUnlockEvents

### auditItemUse

Callable Function oder serverseitiger Event Handler.

Input:

```ts
{
  inventoryItemId: string,
  itemId: string,
  capabilityId?: string,
  missionId?: string,
  arSessionId?: string,
  status: "requested" | "accepted" | "completed" | "rejected"
}
```

Ziel:

- protokolliert Item-Nutzung
- erkennt Missbrauch
- dient als Beweis fuer Mission Completion

### validateMissionCompletionWithItem

Callable Function.

Input:

```ts
{
  missionId: string,
  arSessionId?: string,
  requiredItemId?: string,
  requiredCapabilityId?: string,
  evidenceEventIds: string[]
}
```

Pruefung:

1. Nutzer eingeloggt.
2. Mission existiert und ist aktiv.
3. Nutzer besitzt erforderliches Item.
4. Faehigkeit ist freigeschaltet und validated.
5. AR-/Unity-Events passen zur Mission.
6. NFC-/Item-Use-Events sind validiert.
7. Kein Duplicate Completion.
8. Anti-Farming/Plausibilitaet pruefen.

Writes:

- mission completion event
- reward event
- points/xp update
- buddy reaction event

## Nicht erlaubte Client-Writes

- userInventory direkt erzeugen
- nfcTags lesen/schreiben
- buddyCapabilities direkt freischalten
- capabilityUnlockEvents final schreiben
- rewards/punkte final schreiben

## Emulator-Testfaelle

- gueltiger NFC Scan
- revoked NFC Tag
- expired NFC Tag
- duplicate scan
- falscher Nutzer
- falsche Mission
- usageLimit erreicht
- item grant erfolgreich
- capability unlock erfolgreich
- mission completion mit Item erfolgreich
- mission completion ohne Item abgelehnt
