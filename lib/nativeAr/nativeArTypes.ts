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
  | "surface-navigation";

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
};
