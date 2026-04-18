export type AvatarState = {
  hunger: number;
  mood: number;
  energy: number;
  level: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  type: "food" | "care" | "outfit" | "boost";
  price: number;
  effectValue: number;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;

  points: number;
  xp: number;
  energy: number;

  level: number;
  stepsToday: number;
  currency: "points" | "token";

  avatar: AvatarState;
  inventory: InventoryItem[];
};