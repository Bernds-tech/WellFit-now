function readGithubRunnerConfig() {
  const appId = process.env.GITHUB_APP_ID || "";
  const appPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
  const installationId = process.env.GITHUB_INSTALLATION_ID || "";
  const runnerToken = process.env.GITHUB_RUNNER_TOKEN || "";

  const hasAppConfig = Boolean(appId && appPrivateKey && installationId);
  const hasTokenConfig = Boolean(runnerToken);
  const enabled = hasAppConfig || hasTokenConfig;

  return {
    enabled,
    mode: hasAppConfig ? "github_app" : hasTokenConfig ? "runner_token" : "missing_server_config",
  };
}

function isProtectedBranchName(branchName) {
  const normalized = String(branchName || "").trim().toLowerCase();
  return normalized === "main" || normalized === "master";
}

module.exports = { readGithubRunnerConfig, isProtectedBranchName };
