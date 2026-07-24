function isBeta1AppCheckEnforced(environment = process.env) {
  return String(environment.BETA1_ENFORCE_APP_CHECK || "").trim().toLowerCase() === "true";
}

function createBeta1OnCall(onCall, environment = process.env) {
  if (typeof onCall !== "function") {
    throw new TypeError("onCall muss eine Funktion sein.");
  }
  if (!isBeta1AppCheckEnforced(environment)) return onCall;
  return (handler) => onCall({ enforceAppCheck: true }, handler);
}

module.exports = {
  isBeta1AppCheckEnforced,
  createBeta1OnCall,
};
