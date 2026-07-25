export const MISSION_LIFECYCLE_STEPS = Object.freeze([
  Object.freeze({ key: "start", label: "Start" }),
  Object.freeze({ key: "evidence", label: "Bestätigung" }),
  Object.freeze({ key: "review", label: "Review" }),
  Object.freeze({ key: "reward", label: "WFXP" }),
]);

export const ADVENTURE_LIFECYCLE_STEPS = Object.freeze([
  Object.freeze({ key: "access", label: "Zugang" }),
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

const MISSION_KINDS = new Set(["standard", "challenge", "adventure"]);

const MISSION_COPY = Object.freeze({
  standard: Object.freeze({
    readyTitle: "Bereit zum Start",
    readyDetail: "Beim Start erzeugt der Server den gültigen Missionsvorgang und nimmt anschließend deine Bestätigung zur Prüfung an.",
    readyActionLabel: "Mission starten & bestätigen",
    attemptTitle: "Missionsvorgang gestartet",
    attemptDetail: "Bestehender Vorgang: Ein serverseitiger Attempt ist bereits vorhanden. Setze genau diesen Vorgang fort und reiche die vorgesehene Bestätigung ein.",
    attemptActionLabel: "Bestätigung einreichen",
    pendingDetail: "Deine Bestätigung liegt serverseitig vor. Du kannst den Status sicher aktualisieren; es werden bis zur Freigabe keine WFXP gebucht.",
    approvedDetail: "Das Review ist abgeschlossen. Fordere jetzt den serverseitigen Abschluss an; erst dieser Schritt schreibt WFXP in das interne Ledger.",
    rejectedDetail: "Der bestehende Missionsvorgang bleibt erhalten. Reiche eine neue Bestätigung ein; dadurch entsteht weder ein zweiter Attempt noch eine doppelte Belohnung.",
    needsMoreDetail: "Der vorhandene Missionsvorgang wird fortgesetzt. Ergänze die geforderte Bestätigung und sende sie erneut zur Prüfung.",
    completedDetail: "Der Abschluss und die interne WFXP-Buchung wurden für diesen gültigen Zeitraum bereits bestätigt. Eine zweite Buchung ist ausgeschlossen.",
  }),
  challenge: Object.freeze({
    readyTitle: "Challenge-Ort bereit",
    readyDetail: "Beim Start prüft der Server den veröffentlichten Ort, erzeugt den ortsgebundenen Vorgang und nimmt deine Bestätigung zur Prüfung an.",
    readyActionLabel: "Challenge am Ort starten & bestätigen",
    attemptTitle: "Ortsgebundener Vorgang aktiv",
    attemptDetail: "Der bestehende Challenge-Vorgang bleibt an den serverseitig freigegebenen Startort gebunden. Setze genau diesen Vorgang fort und reiche die vorgesehene Bestätigung ein.",
    attemptActionLabel: "Bestätigung am Ort einreichen",
    pendingDetail: "Die ortsgebundene Bestätigung liegt serverseitig vor. Aktualisiere den Reviewstatus; bis zur Freigabe werden keine WFXP gebucht.",
    approvedDetail: "Die ortsgebundene Bestätigung ist freigegeben. Fordere jetzt den serverseitigen Abschluss an; erst dieser Schritt schreibt WFXP in das interne Ledger.",
    rejectedDetail: "Der bestehende ortsgebundene Vorgang bleibt erhalten. Kehre bei Bedarf zum gebundenen Startort zurück und reiche eine neue Bestätigung ein; eine doppelte Belohnung ist ausgeschlossen.",
    needsMoreDetail: "Der ortsgebundene Vorgang wird fortgesetzt. Ergänze die geforderte Bestätigung am gebundenen Startort und sende sie erneut zur Prüfung.",
    completedDetail: "Challenge-Abschluss und interne WFXP-Buchung wurden bereits genau einmal bestätigt. Ein zweiter Abschluss oder Reward ist ausgeschlossen.",
  }),
  adventure: Object.freeze({
    readyTitle: "Zugang noch nicht aktiviert",
    readyDetail: "Aktiviere am veröffentlichten Startort den einmaligen serverseitigen WFXP-Zugang. Erst danach kann die Abenteuerbestätigung eingereicht werden.",
    readyActionLabel: "Zugang am Ort aktivieren",
    attemptTitle: "Abenteuerzugang aktiv",
    attemptDetail: "Der einmalige Zugang bleibt gebucht und der bestehende Abenteuer-Vorgang wird fortgesetzt. Reiche jetzt die vorgesehene Bestätigung ein.",
    attemptActionLabel: "Abschluss zur Prüfung einreichen",
    pendingDetail: "Die Abenteuerbestätigung liegt serverseitig vor. Aktualisiere den Reviewstatus; der bereits gebuchte Zugang bleibt bestehen und bis zur Freigabe werden keine zusätzlichen WFXP vergeben.",
    approvedDetail: "Die Abenteuerbestätigung ist freigegeben. Fordere jetzt den serverseitigen Abschluss an; erst dieser Schritt schreibt die Reward-WFXP in das interne Ledger.",
    rejectedDetail: "Der bereits gebuchte Zugang und der bestehende Abenteuer-Vorgang bleiben erhalten. Reiche eine neue Bestätigung ein; es entsteht weder ein zweiter Zugang noch eine doppelte Belohnung.",
    needsMoreDetail: "Der bezahlte Zugang bleibt aktiv. Ergänze die geforderte Abenteuerbestätigung und sende sie im bestehenden Vorgang erneut zur Prüfung.",
    completedDetail: "Abenteuerabschluss und interne Reward-WFXP wurden bereits bestätigt. Weder Zugangskosten noch Belohnung werden ein zweites Mal gebucht.",
  }),
});

export function normalizeMissionReviewStatus(value) {
  return REVIEW_STATUSES.has(value) ? value : null;
}

function missionKindValue(value) {
  return MISSION_KINDS.has(value) ? value : "standard";
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
  const missionKind = missionKindValue(input.missionKind);
  const copy = MISSION_COPY[missionKind];

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
      detail: "WellFit prüft den gültigen Zeitraum, Standortkontext und vorhandene Missionsvorgänge. Bitte keine zweite Aktion starten.",
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
      detail: "Die Anzeige kann lokale Auswahlwerte enthalten, besitzt aber keine Abschluss-, Zugangs- oder Reward-Autorität. Aktualisiere den Serverstatus, bevor du fortfährst.",
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
      detail: copy.completedDetail,
      actionLabel: missionKind === "challenge" ? "Challenge erledigt" : missionKind === "adventure" ? "Abenteuer erledigt" : "Mission erledigt",
      tone: "success",
      progress: 100,
      completedStepCount: 4,
      actionDisabled: true,
    });
  } else if (!isStarted) {
    result = presentation({
      state: "ready",
      title: copy.readyTitle,
      detail: copy.readyDetail,
      actionLabel: copy.readyActionLabel,
      tone: "neutral",
      progress: 0,
      completedStepCount: 0,
    });
  } else if (reviewStatus === "approved") {
    result = presentation({
      state: "review-approved",
      title: "Bestätigung freigegeben",
      detail: copy.approvedDetail,
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
      detail: copy.rejectedDetail,
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
      detail: copy.needsMoreDetail,
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
      detail: copy.pendingDetail,
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
      title: copy.attemptTitle,
      detail: copy.attemptDetail,
      actionLabel: copy.attemptActionLabel,
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
      detail: "Die aktuelle Aktion wird verarbeitet. Ein erneuter Klick ist nicht erforderlich; bestehende Attempts, Zugänge und Buchungen bleiben idempotent.",
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
