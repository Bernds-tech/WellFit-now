export type MissionUiStatus =
  | "placeholder"
  | "kiDraft"
  | "needsReview"
  | "approved"
  | "active"
  | "completed"
  | "rejected";

export type MissionUiStatusDefinition = {
  status: MissionUiStatus;
  label: string;
  description: string;
  canStart: boolean;
  canGrantReward: false;
};

export const missionUiStatusDefinitions: MissionUiStatusDefinition[] = [
  {
    status: "placeholder",
    label: "Platzhalter",
    description: "Dieser Missionsbereich ist vorbereitet. Echte Missionen werden spaeter erzeugt oder freigegeben.",
    canStart: false,
    canGrantReward: false,
  },
  {
    status: "kiDraft",
    label: "KI-Vorschlag",
    description: "Dieser Vorschlag stammt vom Buddy und muss serverseitig geprueft werden.",
    canStart: false,
    canGrantReward: false,
  },
  {
    status: "needsReview",
    label: "In Pruefung",
    description: "Diese Mission wartet auf Server-/Policy-Freigabe.",
    canStart: false,
    canGrantReward: false,
  },
  {
    status: "approved",
    label: "Freigegeben",
    description: "Diese Mission kann gestartet werden. Rewards werden nach Evidence serverseitig geprueft.",
    canStart: true,
    canGrantReward: false,
  },
  {
    status: "active",
    label: "Aktiv",
    description: "Diese Mission laeuft. Fortschritt bleibt Evidence bis zur Serverentscheidung.",
    canStart: false,
    canGrantReward: false,
  },
  {
    status: "completed",
    label: "Abgeschlossen",
    description: "Diese Mission wurde serverseitig abgeschlossen oder als abgeschlossen angezeigt.",
    canStart: false,
    canGrantReward: false,
  },
  {
    status: "rejected",
    label: "Nicht verfuegbar",
    description: "Diese Mission wurde nicht freigegeben oder ist nicht verfuegbar.",
    canStart: false,
    canGrantReward: false,
  },
];
