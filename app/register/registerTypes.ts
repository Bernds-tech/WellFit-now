export type Language = "de" | "en";
export type Step = 1 | 2 | 3 | 4;

export type PasswordStrength = {
  score: number;
  label: string;
  colorClass: string;
  barClass: string;
  isStrongEnough: boolean;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
};
