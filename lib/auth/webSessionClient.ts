import { User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

type SessionResponse = { ok: boolean; redirectTo?: string; reason?: string };

export async function establishWebSession(user: User): Promise<SessionResponse> {
  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const result = await response.json() as SessionResponse;
  return { ...result, ok: response.ok && result.ok === true };
}

export async function logoutWellFit(allDevices = false) {
  await fetch(`/api/auth/logout${allDevices ? "?all=true" : ""}`, { method: "POST", credentials: "same-origin" });
  await signOut(auth);
}
