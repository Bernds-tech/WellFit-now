export type EconomyServerAuthMode = "beta_body_user_fallback" | "verified_server_auth";
export type EconomyServerAuthStatus = "beta_fallback" | "verified" | "missing_user_id";

export type EconomyServerAuthContext = {
  status: EconomyServerAuthStatus;
  mode: EconomyServerAuthMode;
  finalAuthority: false;
  userId: string;
  requestedBodyUserId: string | null;
  verifiedAuthUserId: string | null;
  ownershipVerified: false;
  reasons: string[];
  nextServerStep: string;
};

export type EconomyServerAuthInput = {
  bodyUserId?: unknown;
  fallbackUserId: string;
  verifiedAuthUserId?: string | null;
};

const normalizeUserId = (value: unknown) => {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
};

export function createEconomyServerAuthContext(input: EconomyServerAuthInput): EconomyServerAuthContext {
  const requestedBodyUserId = normalizeUserId(input.bodyUserId);
  const fallbackUserId = normalizeUserId(input.fallbackUserId) ?? "economy-beta-user";
  const verifiedAuthUserId = normalizeUserId(input.verifiedAuthUserId);

  if (verifiedAuthUserId) {
    return {
      status: "verified",
      mode: "verified_server_auth",
      finalAuthority: false,
      userId: verifiedAuthUserId,
      requestedBodyUserId,
      verifiedAuthUserId,
      ownershipVerified: false,
      reasons: ["server_auth_placeholder_verified_user_id_supplied", "ownership_projection_not_final_yet"],
      nextServerStep:
        "Replace placeholder auth with Firebase/Admin session verification and set ownershipVerified only after server-side ownership checks pass.",
    };
  }

  if (requestedBodyUserId) {
    return {
      status: "beta_fallback",
      mode: "beta_body_user_fallback",
      finalAuthority: false,
      userId: requestedBodyUserId,
      requestedBodyUserId,
      verifiedAuthUserId: null,
      ownershipVerified: false,
      reasons: ["body_user_id_used_as_beta_fallback", "not_final_authority", "server_auth_not_enforced_yet"],
      nextServerStep:
        "Require server-verified auth userId before enabling final ledger persistence or Firestore rules hardening.",
    };
  }

  return {
    status: "missing_user_id",
    mode: "beta_body_user_fallback",
    finalAuthority: false,
    userId: fallbackUserId,
    requestedBodyUserId: null,
    verifiedAuthUserId: null,
    ownershipVerified: false,
    reasons: ["missing_body_user_id", "using_safe_beta_fallback_user_id", "not_final_authority"],
    nextServerStep:
      "Require authenticated user context for production server completion. Current fallback is only for beta preview compatibility.",
  };
}

export function summarizeEconomyServerAuthContext(context: EconomyServerAuthContext) {
  return {
    status: context.status,
    mode: context.mode,
    finalAuthority: context.finalAuthority,
    userId: context.userId,
    requestedBodyUserId: context.requestedBodyUserId,
    verifiedAuthUserId: context.verifiedAuthUserId,
    ownershipVerified: context.ownershipVerified,
    reasons: context.reasons,
    nextServerStep: context.nextServerStep,
  };
}
