export type NativeArPlatform = "android-arcore" | "ios-arkit" | "unity-ar-foundation" | "web-fallback";

export type NativeArCapability =
  | "world-tracking"
  | "plane-detection"
  | "hit-test"
  | "persistent-anchors"
  | "light-estimation"
  | "occlusion"
  | "scene-mesh"
  | "character-animation"
  | "surface-navigation"
  | "buddy-guide"
  | "buddy-dialogue"
  | "buddy-abilities"
  | "ar-hint-markers";

export type NativeArSessionStatus = "unavailable" | "checking" | "ready" | "running" | "error";

export type NativeArAnchor = {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rotationY?: number;
  surfaceType?: "floor" | "table" | "couch" | "shelf" | "wall" | "unknown";
  createdAt: string;
};

export type NativeArSurface = {
  id: string;
  type: "horizontal" | "vertical" | "unknown";
  label: "floor" | "table" | "couch" | "shelf" | "wall" | "unknown";
  center: { x: number; y: number; z: number };
  extent?: { width: number; height: number };
  confidence: number;
};

export type NativeArFlammiAction =
  | "idle"
  | "lookAround"
  | "walk"
  | "hop"
  | "jumpDown"
  | "climbUp"
  | "land"
  | "happy"
  | "return";

export type NativeArBuddyAction =
  | NativeArFlammiAction
  | "scanObject"
  | "fetchClue"
  | "carry"
  | "mark"
  | "pointAtObject"
  | "revealHint";

export type NativeArBuddyMood = "neutral" | "happy" | "curious" | "helpful" | "warning";

export type NativeArBuddyEventType =
  | "onArReady"
  | "onPlaneDetected"
  | "onAnchorCreated"
  | "onBuddyPlaced"
  | "onBuddyActionStarted"
  | "onBuddyActionCompleted"
  | "onBuddyActionRejected"
  | "onBuddyReachedSurface"
  | "onBuddyDialogueShown"
  | "onBuddyDialogueCompleted"
  | "onBuddyMissionSuggested"
  | "onBuddyCapabilityNeeded"
  | "onBuddyMissionProgress"
  | "onBuddyContextUpdated"
  | "onArHintMarkerCreated"
  | "onArHintMarkerFocused"
  | "onArHintMarkerResolved"
  | "onArError";

export type NativeArBuddyEventPayload = {
  status?: string;
  message?: string;
  code?: string;
  reason?: string;
  missionId?: string;
  missionType?: string;
  buddyId?: string;
  anchorId?: string;
  surfaceId?: string;
  surfaceKind?: "Unknown" | "Floor" | "Table" | "Couch" | "Shelf" | "Platform";
  markerId?: string;
  markerType?: string;
  itemId?: string;
  capabilityId?: string;
  ability?: NativeArBuddyAction | string;
  action?: NativeArBuddyAction | string;
  mood?: NativeArBuddyMood | string;
  messageKey?: string;
  confidence?: number;
  targetId?: string;
  recommendation?: string;
  rewardStatus?: string;
  requiredCapability?: string;
  requiredItemId?: string;
  progressStatus?: string;
  suggestedMissionId?: string;
  ageBand?: string;
  payload?: Record<string, unknown>;
};

/**
 * AR buddy events are telemetry/evidence candidates only.
 * These flags are intentionally literal false to prevent Unity, PWA fallback,
 * or any client-side bridge from becoming the authority for rewards or mission completion.
 */
export type NativeArBuddyEvent = {
  eventId: string;
  eventType: NativeArBuddyEventType;
  buddyId: string;
  missionId?: string;
  arSessionId?: string;
  anchorId?: string;
  surfaceId?: string;
  markerId?: string;
  capabilityId?: string;
  itemId?: string;
  clientTimestamp: string;
  payload: NativeArBuddyEventPayload;
  rewardAuthorized: false;
  missionCompletionAuthorized: false;
};

export type NativeArBuddyEventHandler = (event: NativeArBuddyEvent) => void | Promise<void>;

export type NativeArSessionState = {
  available: boolean;
  platform: NativeArPlatform;
  status: NativeArSessionStatus;
  capabilities: NativeArCapability[];
  anchors: NativeArAnchor[];
  surfaces: NativeArSurface[];
  message: string;
};

export type NativeArBridge = {
  getStatus: () => Promise<NativeArSessionState>;
  startSession: () => Promise<NativeArSessionState>;
  stopSession: () => Promise<NativeArSessionState>;
  placeFlammiAtHitTest: (input: { screenX: number; screenY: number }) => Promise<NativeArAnchor>;
  moveFlammiToAnchor: (anchorId: string, action?: NativeArFlammiAction) => Promise<NativeArSessionState>;
  makeFlammiPerform: (action: NativeArFlammiAction) => Promise<NativeArSessionState>;
  emitBuddyEvent?: (event: NativeArBuddyEvent) => Promise<void>;
  subscribeToBuddyEvents?: (handler: NativeArBuddyEventHandler) => () => void;
};

export const createNativeArBuddyEvent = (input: {
  eventType: NativeArBuddyEventType;
  buddyId?: string;
  missionId?: string;
  arSessionId?: string;
  anchorId?: string;
  surfaceId?: string;
  markerId?: string;
  capabilityId?: string;
  itemId?: string;
  payload?: NativeArBuddyEventPayload;
}): NativeArBuddyEvent => ({
  eventId: `ar_evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  eventType: input.eventType,
  buddyId: input.buddyId ?? "default",
  missionId: input.missionId,
  arSessionId: input.arSessionId,
  anchorId: input.anchorId,
  surfaceId: input.surfaceId,
  markerId: input.markerId,
  capabilityId: input.capabilityId,
  itemId: input.itemId,
  clientTimestamp: new Date().toISOString(),
  payload: input.payload ?? {},
  rewardAuthorized: false,
  missionCompletionAuthorized: false,
});
