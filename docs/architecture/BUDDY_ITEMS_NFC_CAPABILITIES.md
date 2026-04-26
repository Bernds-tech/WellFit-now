# WellFit Buddy Items / NFC / Capabilities Architecture

## Ziel

Buddy-Ausrüstung und Real-World-Items sollen Gameplay ermöglichen: klettern, springen, Hinweise holen, Objekte scannen, Rätsel freischalten.

Diese Systeme sind produktkritisch und dürfen nicht clientseitig autorisiert werden.

## Grundregel

Client, PWA, Mobile App und Unity senden nur Events und Beweise.

Backend / Cloud Functions / Firestore Rules entscheiden:

- Item erhalten
- Fähigkeit freischalten
- NFC-Scan gültig
- Mission abgeschlossen
- XP/Punkte/Reward vergeben

## Kern-Collections

### itemDefinitions

Globale Definition aller Items.

Felder:

- itemId
- name
- description
- itemType
- rarity
- equipmentSlots
- capabilityUnlocks
- assetKey
- unityPrefabKey
- isTradable
- isConsumable
- isAppStoreSensitive

### userInventory

Besitz des Nutzers.

Felder:

- inventoryItemId
- ownerUserId
- itemId
- source
- quantity
- equipped
- equippedSlot
- serverValidationStatus
- grantedByEventId
- grantedAt
- revokedAt

### buddyCapabilities

Freigeschaltete Buddy-Fähigkeiten.

Felder:

- userId
- buddyId
- capabilityId
- unlocked
- unlockedByItemId
- unlockedByMissionId
- unlockedAt
- expiresAt
- serverValidationStatus

### nfcTags

Registrierte NFC-/Real-World-Tags.

Felder:

- tagId
- publicCode
- purpose
- status
- linkedItemId
- linkedCapabilityId
- linkedMissionId
- allowedUserIds
- allowedGroupIds
- usageLimit
- usageCount
- validFrom
- validUntil
- partnerId
- locationHint

### nfcScanEvents

Audit-Log aller NFC-Scans.

Felder:

- scanEventId
- tagId
- publicCode
- userId
- missionId
- status
- rejectionReason
- grantedItemId
- grantedCapabilityId
- createdAt
- validatedAt

### capabilityUnlockEvents

Audit-Log aller Fähigkeitsfreischaltungen.

Felder:

- eventId
- userId
- buddyId
- capabilityId
- source
- sourceEventId
- status
- createdAt

## Cloud Functions

### validateNfcScan

Input:

- userId
- publicCode
- signedPayload optional
- missionId optional
- scannedAt
- deviceId optional

Prüft:

- Tag existiert
- Tag aktiv
- Zeitfenster gültig
- Nutzungslimit nicht überschritten
- Nutzer oder Gruppe berechtigt
- Mission passt
- keine auffällige Wiederholung

Output:

- accepted
- scanEventId
- grantedItemId optional
- grantedCapabilityId optional
- rejectionReason optional

### grantItemOrCapability

Schreibt serverseitig:

- userInventory
- buddyCapabilities
- capabilityUnlockEvents

### auditItemUse

Speichert, wenn ein Item in AR oder Mission genutzt wurde.

### validateMissionCompletionWithItem

Prüft Mission Completion mit benötigter Fähigkeit oder Item.

## Unity Bridge

Unity bekommt nur validierte Zustände:

- equippedItems
- unlockedCapabilities
- currentMissionRequiredCapability

Unity meldet:

- onBuddyItemUsed
- onBuddyCapabilityActionStarted
- onBuddyCapabilityActionCompleted
- onBuddyReachedTarget

Unity entscheidet nicht:

- Reward
- Punkte
- XP
- Mission Completion
- Token/WFT

## Sicherheitsrisiken

- kopierte NFC-Tags
- mehrfaches Scannen
- Tag-Sharing
- GPS-Spoofing
- Client-Manipulation
- Item-Duplikation
- Reward-Farming

## Gegenmaßnahmen

- Servervalidierung immer erforderlich
- usageLimit und timeWindow
- Audit-Log
- Tag-Revocation
- signedPayload / rotating secret später
- Device- und Session-Heuristiken
- Mission-Kontextprüfung
- Anti-Farming Score
