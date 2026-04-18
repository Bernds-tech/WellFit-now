export function getReward(activity: "steps" | "quiz" | "challenge") {
  switch (activity) {
    case "steps":
      return { points: 10, xp: 5 };

    case "quiz":
      return { points: 15, xp: 10 };

    case "challenge":
      return { points: 50, xp: 25 };

    default:
      return { points: 0, xp: 0 };
  }
}