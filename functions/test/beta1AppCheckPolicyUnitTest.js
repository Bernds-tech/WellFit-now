const assert = require("node:assert/strict");
const {
  isBeta1AppCheckEnforced,
  createBeta1OnCall,
} = require("../lib/beta1AppCheckPolicy");

function run() {
  assert.equal(isBeta1AppCheckEnforced({}), false);
  assert.equal(isBeta1AppCheckEnforced({ BETA1_ENFORCE_APP_CHECK: "false" }), false);
  assert.equal(isBeta1AppCheckEnforced({ BETA1_ENFORCE_APP_CHECK: "TRUE" }), true);

  const directCalls = [];
  const directOnCall = (...args) => {
    directCalls.push(args);
    return { args };
  };
  const disabled = createBeta1OnCall(directOnCall, { BETA1_ENFORCE_APP_CHECK: "false" });
  assert.equal(disabled, directOnCall, "Ohne Enforcement muss die vorhandene Emulator-/Beta-Signatur unveraendert bleiben.");
  const handler = async () => ({ accepted: true });
  disabled(handler);
  assert.equal(directCalls.length, 1);
  assert.equal(directCalls[0][0], handler);

  const enforcedCalls = [];
  const enforcedOnCallBase = (...args) => {
    enforcedCalls.push(args);
    return { args };
  };
  const enforced = createBeta1OnCall(enforcedOnCallBase, { BETA1_ENFORCE_APP_CHECK: "true" });
  enforced(handler);
  assert.equal(enforcedCalls.length, 1);
  assert.deepEqual(enforcedCalls[0][0], { enforceAppCheck: true });
  assert.equal(enforcedCalls[0][1], handler);

  assert.throws(() => createBeta1OnCall(null), /onCall muss eine Funktion sein/);
  console.log("WellFit Beta 1 App Check Policy Unit Test erfolgreich.");
}

run();
