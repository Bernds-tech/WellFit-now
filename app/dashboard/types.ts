import type { RewardPreviewDecision } from "@/lib/economy";

export type PersonalMission = {
  title: string;
  steps: number;
  activity: string;
  goal: string;
  focus: string;
  reward: number;
  note: string;
};

export type DashboardMissionPreview = {
  decision: RewardPreviewDecision;
  label: string;
};
