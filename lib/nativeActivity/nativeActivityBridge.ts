import type { NativeActivityBridge, NativeActivityBridgeStatus, NativeActivitySnapshot } from "./nativeActivityTypes";

function getWebFallbackStatus(): NativeActivityBridgeStatus {
  return {
    available: false,
    platform: "web",
    permissionState: "unavailable",
    message: "Native Schritt-Chip-Daten sind in der Web/PWA-Version nicht verfügbar. Dafür wird die Android/iOS-App-Schicht benötigt.",
  };
}

export const nativeActivityBridge: NativeActivityBridge = {
  async getStatus() {
    return getWebFallbackStatus();
  },

  async requestPermissions() {
    return getWebFallbackStatus();
  },

  async getTodaySnapshot(): Promise<NativeActivitySnapshot> {
    throw new Error("Native Activity Snapshot ist nur in der Android/iOS-App-Schicht verfügbar.");
  },
};
