import type {
  NativeArBridge,
  NativeArBuddyEvent,
  NativeArBuddyEventHandler,
  NativeArSessionState,
} from "./nativeArTypes";

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

const buddyEventHandlers = new Set<NativeArBuddyEventHandler>();
const recentBuddyEvents: NativeArBuddyEvent[] = [];
const maxRecentBuddyEvents = 50;

const normalizeBuddyEvent = (event: NativeArBuddyEvent): NativeArBuddyEvent => ({
  ...event,
  rewardAuthorized: false,
  missionCompletionAuthorized: false,
  payload: event.payload ?? {},
});

const rememberBuddyEvent = (event: NativeArBuddyEvent) => {
  recentBuddyEvents.unshift(event);
  if (recentBuddyEvents.length > maxRecentBuddyEvents) {
    recentBuddyEvents.length = maxRecentBuddyEvents;
  }
};

export const getRecentNativeArBuddyEvents = () => [...recentBuddyEvents];

export const clearRecentNativeArBuddyEvents = () => {
  recentBuddyEvents.length = 0;
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

  async emitBuddyEvent(event) {
    const safeEvent = normalizeBuddyEvent(event);
    rememberBuddyEvent(safeEvent);

    await Promise.all(
      [...buddyEventHandlers].map(async (handler) => {
        try {
          await handler(safeEvent);
        } catch (error) {
          console.error("WellFit Native AR Buddy Event Handler Fehler", error);
        }
      })
    );
  },

  subscribeToBuddyEvents(handler) {
    buddyEventHandlers.add(handler);

    return () => {
      buddyEventHandlers.delete(handler);
    };
  },
};

export const emitNativeArBuddyEvent = async (event: NativeArBuddyEvent) => {
  if (!nativeArBridge.emitBuddyEvent) return;
  await nativeArBridge.emitBuddyEvent(event);
};

export const subscribeToNativeArBuddyEvents = (handler: NativeArBuddyEventHandler) => {
  if (!nativeArBridge.subscribeToBuddyEvents) {
    return () => undefined;
  }

  return nativeArBridge.subscribeToBuddyEvents(handler);
};
