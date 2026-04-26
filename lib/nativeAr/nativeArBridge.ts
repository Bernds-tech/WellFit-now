import type { NativeArBridge, NativeArSessionState } from "./nativeArTypes";

const webFallbackState: NativeArSessionState = {
  available: false,
  platform: "web-fallback",
  status: "unavailable",
  capabilities: [],
  anchors: [],
  surfaces: [],
  message:
    "Echte AR-Raumanker sind im Browser/PWA-Fallback nicht verfügbar. Für World Tracking, Plane Detection und Raumanker wird die native ARCore/ARKit- oder Unity-AR-Schicht benötigt.",
};

export const nativeArBridge: NativeArBridge = {
  async getStatus() {
    return webFallbackState;
  },

  async startSession() {
    return webFallbackState;
  },

  async stopSession() {
    return webFallbackState;
  },

  async placeFlammiAtHitTest() {
    throw new Error("Native AR Hit-Test ist nur in der Android/iOS-AR-Schicht verfügbar.");
  },

  async moveFlammiToAnchor() {
    return webFallbackState;
  },

  async makeFlammiPerform() {
    return webFallbackState;
  },
};
