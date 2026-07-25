export const MISSION_LIFECYCLE_STEPS = Object.freeze([
  Object.freeze({ key: "start", label: "Start" }),
  Object.freeze({ key: "evidence", label: "Bestätigung" }),
  Object.freeze({ key: "review", label: "Review" }),
  Object.freeze({ key: "reward", label: "WFXP" }),
]);

const REVIEW_STATUSES = new Set([
  "pending-server-review",
  "approved",
  "rejected",
  "needs-more-evidence",
]);

export function normalizeMissionReviewStatus(value) {
  return REVIEW_STATUSES.has(value) ? value : null;
}

function presentation({
  state,
  title,
  detail,
  actionLabel,
  tone,
  progress,
  completedStepCount,
  canResume = false,
  refreshRecommended = false,
  actionDisabled = false,
}) {
  return Object.freeze({
    state,
    title,
    detail,
    actionLabel,
    tone,
    progress,
    completedStepCount,
    canResume,
    refreshRecommended,
    actionDisabled,
  });
}

export function getMissionStatusPresentation(input = {}) {
  const isAuthenticated = input.isAuthenticated === true;
  const ready = input.ready === true;
  const progressSource = input.progressSource === "server" ? "server" : "local";
  const isStarted = input.isStarted === true;
  const isCompleted = input.isCompleted === true;
  const actionBusy = input.actionBusy === true;
  const reviewStatus = normalizeMissionReviewStatus(input.reviewStatus);

  let result;

  if (!isAuthenticated) {
    result = presentation({
      state: "login-required",
      title: "Login erforderlich",
      detail: "Die lokale Auswahl bleibt sichtbar. Ein serverseitiger Missionsstart und eine WFXP-Buchung sind erst nach dem Login möglich.",
      actionLabel: "Login erforderlich",
      tone: "neutral",
      progress: 0,
      completedStepCount: 0,
      actionDisabled: true,
    });
  } else if (!ready) {
    result = presentation({
      state: "loading",
      title: "Serverstatus wird geladen",
      detail: "WellFit prüft den gültigen Zeitraum und vorhandene Missionsvorgänge. Bitte keine zweite Aktion starten.",
      actionLabel: "Serverstatus wird geladen...",
      tone: "info",
      progress: 0,
      completedStepCount: 0,
      actionDisabled: true,
    });
  } else if (progressSource !== "server") {
    result = presentation({
      state: "server-unavailable",
      title: "Serverprojektion nicht verfügbar",
      detail: "Die Anzeige kann lokale Auswahlwerte enthalten, besitzt aber keine Abschluss- oder Reward-Autorität. Aktualisiere den Serverstatus, bevor du fortfährst.",
      actionLabel: "Serverstatus aktualisieren",
      tone: "warning",
      progress: 0,
      completedStepCount: 0,
      refreshRecommended: true,
      actionDisabled: true,
    });
  } else if (isCompleted) {
    result = presentation({
      state: "completed",
      title: "Serverseitig abgeschlossen",
      detail: "Der Abschluss und die interne WFXP-Buchung wurden für diesen gültigen Zeitraum bereits bestätigt. Eine zweite Buchung ist ausgeschlossen.",
      actionLabel: "Mission erledigt",
      tone: "success",
      progress: 100,
      completedStepCount: 4,
      actionDisabled: true,
    });
  } else if (!isStarted) {
    result = presentation({
      state: "ready",
      title: "Bereit zum Start",
      detail: "Beim Start erzeugt der Server den gültigen Missionsvorgang und nimmt anschließend deine Bestätigung zur Prüfung an.",
      actionLabel: "Mission starten & bestätigen",
      tone: "neutral",
      progress: 0,
      completedStepCount: 0,
    });
  } else if (reviewStatus === "approved") {
    result = presentation({
      state: "review-approved",
      title: "Bestätigung freigegeben",
      detail: "Das Review ist abgeschlossen. Fordere jetzt den serverseitigen Abschluss an; erst dieser Schritt schreibt WFXP in das interne Ledger.",
      actionLabel: "Freigabe abschließen",
      tone: "success",
      progress: 82,
      completedStepCount: 3,
      canResume: true,
    });
  } else if (reviewStatus === "rejected") {
    result = presentation({
      state: "review-rejected",
      title: "Bestätigung abgelehnt",
      detail: "Der bestehende Missionsvorgang bleibt erhalten. Reiche eine neue Bestätigung ein; dadurch entsteht weder ein zweiter Attempt noch eine doppelte Belohnung.",
      actionLabel: "Bestätigung neu einreichen",
      tone: "error",
      progress: 42,
      completedStepCount: 2,
      canResume: true,
    });
  } else if (reviewStatus === "needs-more-evidence") {
    result = presentation({
      state: "review-needs-more",
      title: "Weitere Bestätigung erforderlich",
      detail: "Der vorhandene Missionsvorgang wird fortgesetzt. Ergänze die geforderte Bestätigung und sende sie erneut zur Prüfung.",
      actionLabel: "Bestätigung ergänzen",
      tone: "warning",
      progress: 42,
      completedStepCount: 2,
      canResume: true,
    });
  } else if (reviewStatus === "pending-server-review") {
    result = presentation({
      state: "review-pending",
      title: "Prüfung läuft",
      detail: "Deine Bestätigung liegt serverseitig vor. Du kannst den Status sicher aktualisieren; es werden bis zur Freigabe keine WFXP gebucht.",
      actionLabel: "Reviewstatus prüfen",
      tone: "info",
      progress: 58,
      completedStepCount: 2,
      canResume: true,
      refreshRecommended: true,
    });
  } else {
    result = presentation({
      state: "attempt-open",
      title: "Missionsvorgang gestartet",
      detail: "Bestehender Vorgang: Ein serverseitiger Attempt ist bereits vorhanden. Setze genau diesen Vorgang fort und reiche die vorgesehene Bestätigung ein.",
      actionLabel: "Bestätigung einreichen",
      tone: "info",
      progress: 25,
      completedStepCount: 1,
      canResume: true,
    });
  }

  if (actionBusy && !isCompleted) {
    return presentation({
      ...result,
      state: "processing",
      title: "Server verarbeitet den Vorgang",
      detail: "Die aktuelle Aktion wird verarbeitet. Ein erneuter Klick ist nicht erforderlich; bestehende Attempts und Buchungen bleiben idempotent.",
      actionLabel: "Server wird kontaktiert...",
      tone: "info",
      actionDisabled: true,
    });
  }

  return result;
}

export function formatMissionDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateKey || ""));
  if (!match) return String(dateKey || "–");
  return `${match[3]}.${match[2]}.${match[1]}`;
}

export function formatMissionTimeZone(timeZone) {
  const normalized = String(timeZone || "").trim();
  return normalized ? normalized.replaceAll("_", " ") : "Zeitzone wird bestimmt";
}
