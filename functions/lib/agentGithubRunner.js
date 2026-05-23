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

function hasGithubServerConfig() {
  return readGithubRunnerConfig().enabled;
}

function githubApiImplementationAvailable() {
  return false;
}

function buildGithubRunnerCapability() {
  const config = readGithubRunnerConfig();
  const apiImplemented = githubApiImplementationAvailable();
  return {
    hasServerConfig: config.enabled,
    configMode: config.mode,
    githubApiImplemented: apiImplemented,
    realGithubIntegration: Boolean(config.enabled && apiImplemented),
    status: !config.enabled ? "missing_server_config" : apiImplemented ? "metadata_only" : "github_api_not_implemented",
  };
}

module.exports = { readGithubRunnerConfig, isProtectedBranchName, hasGithubServerConfig, githubApiImplementationAvailable, buildGithubRunnerCapability };
