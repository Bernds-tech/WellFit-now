export type MobileTabId = "missions" | "buddy" | "scan" | "settings";

export type MobileQuickAction = {
  label: string;
  description: string;
  href?: string;
  disabled?: boolean;
};

export type MobileFocusCard = {
  title: string;
  value: string;
  helper: string;
};
