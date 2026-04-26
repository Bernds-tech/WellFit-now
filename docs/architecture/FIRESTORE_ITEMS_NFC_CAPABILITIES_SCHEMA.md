# Firestore Schema - Items / NFC / Buddy Capabilities

## Grundsatz

Items, NFC-Scans und Buddy-Faehigkeiten sind produktkritisch. Der Client darf nur Events senden. Backend, Cloud Functions und Firestore Rules sind Autoritaet.

## Collections

### itemDefinitions/{itemId}

Globale Item-Definitionen.

```ts
{
  itemId: string,
  name: string,
  description: string,
  itemType: "cosmetic" | "tool" | "protection" | "movement" | "puzzle" | "event-nfc" | "partner",
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary" | "event",
  equipmentSlots: string[],
  capabilityUnlocks: string[],
  assetKey?: string,
  unityPrefabKey?: string,
  isTradable: boolean,
  isConsumable: boolean,
  isAppStoreSensitive: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Rule-Ziel:

- Lesen: eingeloggte Nutzer optional erlaubt, falls Shop/Inventar sichtbar sein soll.
- Schreiben: nur Admin/Server.

### userInventory/{inventoryItemId}

Besitz eines Nutzers.

```ts
{
  inventoryItemId: string,
  ownerUserId: string,
  itemId: string,
  source: "mission" | "shop" | "nfc" | "partner" | "event" | "admin",
  quantity: number,
  equipped: boolean,
  equippedSlot?: string,
  serverValidationStatus: "pending" | "validated" | "rejected" | "revoked",
  grantedByEventId?: string,
  grantedAt: Timestamp,
  revokedAt?: Timestamp
}
```

Rule-Ziel:

- Lesen: nur ownerUserId oder Admin.
- Schreiben: nur Server/Cloud Function.
- Client darf nicht direkt Items erzeugen, Menge erhoehen oder Status aendern.

### buddyCapabilities/{capabilityDocId}

Freigeschaltete Buddy-Faehigkeiten.

```ts
{
  userId: string,
  buddyId: string,
  capabilityId: string,
  unlocked: boolean,
  unlockedByItemId?: string,
  unlockedByMissionId?: string,
  unlockedAt?: Timestamp,
  expiresAt?: Timestamp,
  serverValidationStatus: "pending" | "validated" | "rejected" | "revoked"
}
```

Rule-Ziel:

- Lesen: nur userId oder Admin.
- Schreiben: nur Server/Cloud Function.

### nfcTags/{tagId}

Registrierte NFC-/Real-World-Tags.

```ts
{
  tagId: string,
  publicCode: string,
  purpose: "grantItem" | "unlockCapability" | "startMission" | "revealHint" | "partnerCheckIn",
  status: "active" | "inactive" | "revoked" | "expired" | "blocked",
  linkedItemId?: string,
  linkedCapabilityId?: string,
  linkedMissionId?: string,
  allowedUserIds?: string[],
  allowedGroupIds?: string[],
  usageLimit?: number,
  usageCount: number,
  validFrom?: Timestamp,
  validUntil?: Timestamp,
  partnerId?: string,
  locationHint?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

Rule-Ziel:

- Lesen: nicht allgemein oeffentlich, damit Tags nicht ausgelesen/farmbar werden.
- Schreiben: nur Admin/Server.

### nfcScanEvents/{scanEventId}

Audit-Log aller NFC-Scans.

```ts
{
  scanEventId: string,
  tagId?: string,
  publicCode: string,
  userId: string,
  source: "nfc",
  missionId?: string,
  status: "received" | "validated" | "rejected" | "duplicate" | "blocked",
  rejectionReason?: string,
  grantedItemId?: string,
  grantedCapabilityId?: string,
  createdAt: Timestamp,
  validatedAt?: Timestamp,
  deviceId?: string,
  appSessionId?: string,
  approximateLocationHash?: string
}
```

Rule-Ziel:

- Client darf optional Scan-Anfrage in separate request Collection schreiben, aber nicht direkt validated Events erzeugen.
- Besser: Callable Cloud Function `validateNfcScan` nutzen.
- Lesen: Nutzer darf eigene ScanEvents sehen, Admin darf alle sehen.
- Schreiben: Server.

### capabilityUnlockEvents/{eventId}

Audit-Log aller Faehigkeitsfreischaltungen.

```ts
{
  eventId: string,
  userId: string,
  buddyId: string,
  capabilityId: string,
  source: "mission" | "shop" | "nfc" | "partner" | "event" | "admin",
  sourceEventId?: string,
  status: "requested" | "accepted" | "completed" | "rejected",
  createdAt: Timestamp,
  completedAt?: Timestamp
}
```

Rule-Ziel:

- Lesen: Nutzer darf eigene Events sehen.
- Schreiben: Server/Cloud Function.

## Empfohlene Indizes

- userInventory: ownerUserId + equipped
- userInventory: ownerUserId + itemId
- buddyCapabilities: userId + buddyId + capabilityId
- nfcScanEvents: userId + createdAt desc
- nfcScanEvents: publicCode + userId + createdAt desc
- capabilityUnlockEvents: userId + createdAt desc

## Sicherheitsprinzip

Alle Collections, die Rewards, Items, Capabilities oder Mission Completion beeinflussen, sind serverautorisiert.
