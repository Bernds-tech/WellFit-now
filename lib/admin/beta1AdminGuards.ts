import { getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AdminGuardState = "loading" | "denied" | "unverifiable" | "allowed";

export type AdminClaimGuardResult = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  state: AdminGuardState;
  message: string;
};

export async function verifyAdminClaim(): Promise<AdminClaimGuardResult> {
  const user = auth.currentUser;
  if (!user) {
    return { isAuthenticated: false, isAdmin: false, isVerified: false, state: "denied", message: "Bitte einloggen. Admin-Zugriff verweigert." };
  }

  try {
    const tokenResult = await getIdTokenResult(user, true);
    const isAdmin = tokenResult.claims?.admin === true;
    if (!isAdmin) {
      return { isAuthenticated: true, isAdmin: false, isVerified: true, state: "denied", message: "Kein Admin-Claim gefunden. Zugriff verweigert." };
    }
    return { isAuthenticated: true, isAdmin: true, isVerified: true, state: "allowed", message: "Admin-Claim verifiziert. Server-Callables bleiben finale Autorität." };
  } catch {
    return { isAuthenticated: true, isAdmin: false, isVerified: false, state: "unverifiable", message: "Admin-Claim konnte nicht sicher verifiziert werden. Zugriff blockiert." };
  }
}
