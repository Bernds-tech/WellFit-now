export type BuddyStatus =
  | "active"
  | "tired"
  | "needsCare"
  | "messy"
  | "ranAway"
  | "foundByOther"
  | "recovered";

export type BuddyDailyMode =
  | "abenteuerlustig"
  | "neugierig"
  | "verspielt"
  | "muede"
  | "hungrig"
  | "stolz"
  | "chaotisch";

export type BuddyState = {
  name: string;
  title: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  points: number;
  energy: number;
  hunger: number;
  mood: number;
  cleanliness: number;
  bond: number;
  loyalty: number;
  curiosity: number;
  status: BuddyStatus;
  dailyMode: BuddyDailyMode;
};

export type BuddyActionType = "feed" | "care" | "play" | "clean" | "call" | "search";

export type BuddyAction = {
  type: BuddyActionType;
  label: string;
  description: string;
  cost: number;
  disabled?: boolean;
};

export type BuddyStat = {
  label: string;
  value: number;
  helper: string;
};
