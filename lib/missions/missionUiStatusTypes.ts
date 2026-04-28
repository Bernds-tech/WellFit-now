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

export const MISSION_PLACEHOLDER_NOTICE =
  "Dieser Bereich ist vorbereitet. Missionen werden spaeter vom KI-Buddy erzeugt. Rewards werden serverseitig geprueft.";

export const MISSION_SERVER_REWARD_NOTICE =
  "Keine UI autorisiert Punkte, XP, Rewards, Mission Completion, Wettkampf-Sieger oder Token/WFT. Final entscheidet spaeter Server/Policy/Ledger.";

export const missionUiStatusDefinitions: MissionUiStatusDefinition[] = [
  {
    status: "placeholder",
    label: "Platzhalter",
    description: MISSION_PLACEHOLDER_NOTICE,
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
    description: "Diese Mission darf nur nach Server-Completion als abgeschlossen gelten.",
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

export const missionUiStatusDefinitionByStatus = missionUiStatusDefinitions.reduce(
  (acc, definition) => {
    acc[definition.status] = definition;
    return acc;
  },
  {} as Record<MissionUiStatus, MissionUiStatusDefinition>,
);

export const getMissionUiStatusDefinition = (status: MissionUiStatus): MissionUiStatusDefinition =>
  missionUiStatusDefinitionByStatus[status];

export const getMissionUiStatusLabel = (status: MissionUiStatus): string =>
  getMissionUiStatusDefinition(status).label;

export const isMissionUiStatusStartable = (status: MissionUiStatus): boolean =>
  getMissionUiStatusDefinition(status).canStart;

export const canMissionUiStatusGrantReward = (_status: MissionUiStatus): false => false;
