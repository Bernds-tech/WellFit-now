import { auth, db } from "@/lib/firebase";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { mapCheckpoint, mapChildProfile, mapGlitchEvent, mapInventoryItem, mapLedger, mapMissionSummary, mapShopItem, mapWallet } from "./beta1ReadGuards";
import type { Beta1AnalyticsOwnViewProjection, Beta1CheckpointSummary, Beta1ChildProfileSummary, Beta1GlitchEventSummary, Beta1InventoryItem, Beta1LeaderboardPreview, Beta1MissionSummary, Beta1ShopItem, Beta1XpLedgerEvent, Beta1XpWalletProjection } from "./beta1Types";

const friendlyError = (error: unknown) => {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
  if (code.includes("permission-denied")) return "Keine Berechtigung für diese Beta-1 Ansicht.";
  if (code.includes("unauthenticated")) return "Bitte einloggen, um Beta-1 Daten zu sehen.";
  return "Beta-1 Daten konnten gerade nicht geladen werden.";
};

export async function readXpWalletProjection(): Promise<{ data: Beta1XpWalletProjection | null; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return { data: null, error: "Bitte einloggen, um Wallet-Projektion zu sehen." };
    const snapshot = await getDocs(query(collection(db, "xpWallets"), where("ownerUserId", "==", userId), limit(1)));
    if (snapshot.empty) return { data: null, error: null };
    const docSnap = snapshot.docs[0];
    return { data: mapWallet(docSnap.id, docSnap.data()), error: null };
  } catch (error) {
    return { data: null, error: friendlyError(error) };
  }
}

export async function readXpLedgerEvents(): Promise<{ data: Beta1XpLedgerEvent[]; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return { data: [], error: "Bitte einloggen, um Ledger-Einträge zu sehen." };
    const snapshot = await getDocs(query(collection(db, "xpLedgerEvents"), where("ownerUserId", "==", userId), orderBy("createdAt", "desc"), limit(10)));
    return { data: snapshot.docs.map((docSnap) => mapLedger(docSnap.id, docSnap.data())), error: null };
  } catch (error) {
    return { data: [], error: friendlyError(error) };
  }
}

export async function readPublishedMissions(): Promise<{ data: Beta1MissionSummary[]; error: string | null }> {
  try {
    const snapshot = await getDocs(query(collection(db, "missions"), where("status", "==", "published"), limit(8)));
    return { data: snapshot.docs.map((docSnap) => mapMissionSummary(docSnap.id, docSnap.data())), error: null };
  } catch (error) {
    return { data: [], error: friendlyError(error) };
  }
}

export async function readInventoryAndShop(): Promise<{ inventory: Beta1InventoryItem[]; shopItems: Beta1ShopItem[]; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    const [inventorySnap, shopSnap] = await Promise.all([
      userId ? getDocs(query(collection(db, "userInventory"), where("ownerUserId", "==", userId), limit(8))) : Promise.resolve(null),
      getDocs(query(collection(db, "shopItems"), where("status", "==", "published"), limit(8))),
    ]);
    return {
      inventory: inventorySnap ? inventorySnap.docs.map((docSnap) => mapInventoryItem(docSnap.id, docSnap.data())) : [],
      shopItems: shopSnap.docs.map((docSnap) => mapShopItem(docSnap.id, docSnap.data())),
      error: userId ? null : "Bitte einloggen, um Inventory zu sehen.",
    };
  } catch (error) {
    return { inventory: [], shopItems: [], error: friendlyError(error) };
  }
}

export async function readCheckpointAndGlitch(): Promise<{ checkpoints: Beta1CheckpointSummary[]; glitches: Beta1GlitchEventSummary[]; error: string | null }> {
  try {
    const [checkpointsSnap, glitchSnap] = await Promise.all([
      getDocs(query(collection(db, "checkpoints"), where("status", "==", "published"), limit(6))),
      getDocs(query(collection(db, "glitchEvents"), where("status", "==", "active"), limit(6))),
    ]);
    return {
      checkpoints: checkpointsSnap.docs.map((docSnap) => mapCheckpoint(docSnap.id, docSnap.data())),
      glitches: glitchSnap.docs.map((docSnap) => mapGlitchEvent(docSnap.id, docSnap.data())),
      error: null,
    };
  } catch (error) {
    return { checkpoints: [], glitches: [], error: friendlyError(error) };
  }
}

export async function readGuardianChildProfiles(): Promise<{ data: Beta1ChildProfileSummary[]; error: string | null }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return { data: [], error: "Bitte einloggen, um verknüpfte Child-Profile zu sehen." };

    const linksSnap = await getDocs(query(collection(db, "guardianChildLinks"), where("guardianUserId", "==", userId), limit(6)));
    const childIds = linksSnap.docs
      .map((docSnap) => docSnap.data().childProfileId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (childIds.length === 0) return { data: [], error: null };

    const childSnapshots = await Promise.all(
      childIds.map((childId) => getDocs(query(collection(db, "childProfiles"), where("childProfileId", "==", childId), limit(1)))),
    );

    const children = childSnapshots
      .filter((snap) => !snap.empty)
      .map((snap) => mapChildProfile(snap.docs[0].id, snap.docs[0].data()));

    return { data: children, error: null };
  } catch (error) {
    return { data: [], error: friendlyError(error) };
  }
}


export async function readLeaderboardPreview(): Promise<{ data: Beta1LeaderboardPreview; error: string | null }> {
  const [walletRes, missionRes, checkpointRes] = await Promise.all([readXpWalletProjection(), readPublishedMissions(), readCheckpointAndGlitch()]);
  const rows = walletRes.data
    ? [{ id: "self", rankLabel: "Eigene Ansicht", displayName: "Du (privat)", wfxp: walletRes.data.balance, missions: missionRes.data.length, checkpoints: checkpointRes.checkpoints.length, scope: "self" as const }]
    : [];

  return {
    data: {
      rows,
      summary: { wfxp: walletRes.data?.balance ?? 0, missions: missionRes.data.length, checkpoints: checkpointRes.checkpoints.length },
      isLimited: true,
      note: "Limited Preview: Keine freigegebene serverseitige Leaderboard-Aggregation fuer andere Profile vorhanden.",
    },
    error: walletRes.error || missionRes.error || checkpointRes.error,
  };
}


export async function readAnalyticsOwnView(): Promise<{ data: Beta1AnalyticsOwnViewProjection; error: string | null }> {
  const [walletRes, ledgerRes, missionRes, inventoryShopRes, checkpointRes] = await Promise.all([
    readXpWalletProjection(),
    readXpLedgerEvents(),
    readPublishedMissions(),
    readInventoryAndShop(),
    readCheckpointAndGlitch(),
  ]);

  return {
    data: {
      wfxpBalance: walletRes.data?.balance ?? 0,
      ledgerEvents: ledgerRes.data.length,
      publishedMissions: missionRes.data.length,
      publishedCheckpoints: checkpointRes.checkpoints.length,
      inventoryItems: inventoryShopRes.inventory.length,
      publishedShopItems: inventoryShopRes.shopItems.length,
      hasServerAnalyticsProjection: false,
      note: "Limited own-view aus vorhandenen sicheren Read-Projections. Keine serverseitige Analytics-Spezialprojektion freigegeben.",
    },
    error: walletRes.error || ledgerRes.error || missionRes.error || inventoryShopRes.error || checkpointRes.error,
  };
}
