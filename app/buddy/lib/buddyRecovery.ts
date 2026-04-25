import type { BuddyState } from "../types";

export type RecoveryStep = {
  label: string;
  description: string;
  done: boolean;
};

export function getRecoverySteps(buddy: BuddyState): RecoveryStep[] {
  const isAway = buddy.status === "ranAway" || buddy.status === "foundByOther";

  return [
    {
      label: "Spur aufnehmen",
      description: "Flammi hinterlässt später Pfotenabdrücke, Funken oder kleine AR-Hinweise.",
      done: !isAway,
    },
    {
      label: "Rückhol-Köder vorbereiten",
      description: "Futter, Pflegeitem oder Spielzeug kann die Suche später erleichtern.",
      done: buddy.hunger > 55 && buddy.cleanliness > 45,
    },
    {
      label: "AR-Suche starten",
      description: "In Phase 3 kann Flammi im echten Raum oder draußen wiedergefunden werden.",
      done: false,
    },
  ];
}

export function getRecoveryHeadline(buddy: BuddyState) {
  if (buddy.status === "ranAway") return "Flammi ist auf Abenteuer";
  if (buddy.status === "foundByOther") return "Flammi wurde gesehen";
  return "Rückholsystem vorbereitet";
}

export function getRecoveryText(buddy: BuddyState) {
  if (buddy.status === "ranAway") {
    return "Flammi ist weggelaufen. In der finalen Mechanik dauert die Rückholung 1 bis 3 Tage und verbindet Pflege, kleine Aufgaben und AR-Spuren.";
  }

  if (buddy.status === "foundByOther") {
    return "Ein anderer Nutzer kann Flammi später in AR sehen und melden. Der Besitzer bekommt dadurch eine fairere Rückholchance.";
  }

  return "Wenn Bindung und Loyalität stark sinken, kann Flammi später auf Abenteuer gehen. Diese Mechanik ist vorbereitet, aber noch nicht automatisch aktiv.";
}
