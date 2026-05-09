import { NextResponse } from "next/server";
import {
  economyServerCompletionStages,
  serverOnlyEconomyCollections,
  userEconomyClientWriteRiskFields,
  summarizeEconomyServerCompletionPlan,
} from "@/lib/economy";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    mode: "internal_points_beta",
    finalClientAuthority: false,
    tokenized: false,
    walletEnabled: false,
    nftEnabled: false,
    plan: summarizeEconomyServerCompletionPlan(),
    clientWriteRisks: userEconomyClientWriteRiskFields,
    serverOnlyCollections: [...serverOnlyEconomyCollections],
    completionStages: economyServerCompletionStages,
    nextHardeningStep:
      "Keep MVP UI working, but move final mission completion, reward grants, spend execution and avatar/economy projections behind server-authorized ledger events before removing client-writable economy fields from firestore.rules.",
  });
}
