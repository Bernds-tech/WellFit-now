const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

const DEMO_ITEM_DEFINITIONS = [
  {
    itemId: "rope_001",
    name: "Kletterseil",
    description: "Erlaubt deinem Buddy, zu hoeheren Hinweisen zu klettern und kleine Klettermissionen zu loesen.",
    itemType: "tool",
    rarity: "common",
    equipmentSlots: ["back", "tool"],
    capabilityUnlocks: ["climbUp", "fetchClue"],
    assetKey: "items/rope_001",
    unityPrefabKey: "items/rope_001",
    isTradable: false,
    isConsumable: false,
    isAppStoreSensitive: false,
  },
  {
    itemId: "magnifier_001",
    name: "Forscherlupe",
    description: "Hilft deinem Buddy, kleine Hinweise, Blaetter, Symbole und Raetselspuren genauer zu untersuchen.",
    itemType: "puzzle",
    rarity: "common",
    equipmentSlots: ["rightHand", "tool"],
    capabilityUnlocks: ["scanObject", "revealHint"],
    assetKey: "items/magnifier_001",
    unityPrefabKey: "items/magnifier_001",
    isTradable: false,
    isConsumable: false,
    isAppStoreSensitive: false,
  },
  {
    itemId: "small_backpack_001",
    name: "Kleiner Buddy-Rucksack",
    description: "Damit dein Buddy gefundene Hinweise oder kleine Gegenstaende zurueckbringen kann.",
    itemType: "tool",
    rarity: "uncommon",
    equipmentSlots: ["back"],
    capabilityUnlocks: ["carry"],
    assetKey: "items/small_backpack_001",
    unityPrefabKey: "items/small_backpack_001",
    isTradable: false,
    isConsumable: false,
    isAppStoreSensitive: false,
  }
];

const DEMO_NFC_TAGS = [
  {
    tagId: "demo_nfc_rope_tree_001",
    publicCode: "WF-DEMO-ROPE-TREE-001",
    purpose: "grantItem",
    status: "active",
    linkedItemId: "rope_001",
    linkedCapabilityId: "climbUp",
    linkedMissionId: "demo_tree_clue_001",
    usageLimit: 100,
    usageCount: 0,
    partnerId: "wellfit-demo",
    locationHint: "Demo: Baum/Spielplatz/Kletterhinweis",
  },
  {
    tagId: "demo_nfc_magnifier_leaf_001",
    publicCode: "WF-DEMO-MAGNIFIER-LEAF-001",
    purpose: "grantItem",
    status: "active",
    linkedItemId: "magnifier_001",
    linkedCapabilityId: "scanObject",
    linkedMissionId: "demo_leaf_quiz_001",
    usageLimit: 100,
    usageCount: 0,
    partnerId: "wellfit-demo",
    locationHint: "Demo: Blatt-/Naturraetsel",
  }
];

async function seedDemoItemsAndNfc(db = admin.firestore()) {
  const batch = db.batch();
  const timestamp = FieldValue.serverTimestamp();

  for (const item of DEMO_ITEM_DEFINITIONS) {
    const ref = db.collection("itemDefinitions").doc(item.itemId);
    batch.set(ref, {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
  }

  for (const tag of DEMO_NFC_TAGS) {
    const ref = db.collection("nfcTags").doc(tag.tagId);
    batch.set(ref, {
      ...tag,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true });
  }

  await batch.commit();

  return {
    itemDefinitions: DEMO_ITEM_DEFINITIONS.length,
    nfcTags: DEMO_NFC_TAGS.length,
  };
}

module.exports = {
  DEMO_ITEM_DEFINITIONS,
  DEMO_NFC_TAGS,
  seedDemoItemsAndNfc,
};
