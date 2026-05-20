import { getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AdminClaimGuardResult = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  message: string;
};

export async function verifyAdminClaim(): Promise<AdminClaimGuardResult> {
  const user = auth.currentUser;
  if (!user) {
    return { isAuthenticated: false, isAdmin: false, isVerified: false, message: "Bitte einloggen. Admin-Zugriff nicht verifiziert." };
  }

  try {
    const tokenResult = await getIdTokenResult(user, true);
    const isAdmin = tokenResult.claims?.admin === true;
    if (!isAdmin) {
      return { isAuthenticated: true, isAdmin: false, isVerified: true, message: "Kein Admin-Claim gefunden. Zugriff verweigert." };
    }
    return { isAuthenticated: true, isAdmin: true, isVerified: true, message: "Admin-Claim verifiziert." };
  } catch {
    return { isAuthenticated: true, isAdmin: false, isVerified: false, message: "Admin-Zugriff nicht verifiziert." };
  }
}
