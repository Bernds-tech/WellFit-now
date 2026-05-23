const crypto = require("crypto");

function readGithubRunnerConfig() {
  const appId = process.env.GITHUB_APP_ID || "";
  const appPrivateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
  const installationId = process.env.GITHUB_INSTALLATION_ID || "";
  const runnerToken = process.env.GITHUB_RUNNER_TOKEN || "";
  const repoOwner = process.env.GITHUB_REPO_OWNER || "";
  const repoName = process.env.GITHUB_REPO_NAME || "";
  const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
  const hasAppConfig = Boolean(appId && appPrivateKey && installationId);
  const hasTokenConfig = Boolean(runnerToken);
  const enabled = hasAppConfig || hasTokenConfig;
  const hasRepoConfig = Boolean(repoOwner && repoName);
  return { enabled, hasRepoConfig, repoOwner, repoName, baseBranch, appId, appPrivateKey, installationId, runnerToken, mode: hasAppConfig ? "github_app" : hasTokenConfig ? "runner_token" : "missing_server_config" };
}
function isProtectedBranchName(branchName) { const normalized = String(branchName || "").trim().toLowerCase(); return normalized === "main" || normalized === "master"; }
function hasGithubServerConfig() { const c = readGithubRunnerConfig(); return c.enabled && c.hasRepoConfig; }
function githubApiImplementationAvailable() { return true; }
function buildGithubRunnerCapability() { const c = readGithubRunnerConfig(); const apiImplemented = githubApiImplementationAvailable(); return { hasServerConfig: c.enabled && c.hasRepoConfig, configMode: c.mode, githubApiImplemented: apiImplemented, realGithubIntegration: Boolean(c.enabled && c.hasRepoConfig && apiImplemented), status: !(c.enabled && c.hasRepoConfig) ? "missing_server_config" : apiImplemented ? "metadata_only" : "github_api_not_implemented" }; }
function b64urlJson(obj) { return Buffer.from(JSON.stringify(obj)).toString("base64url"); }
function getRepoConfig() { const c = readGithubRunnerConfig(); if (!(c.enabled && c.hasRepoConfig)) { const e = new Error("missing_server_config"); e.code = "missing_server_config"; throw e; } return { owner: c.repoOwner, repo: c.repoName, baseBranch: c.baseBranch || "main" }; }
async function getGithubAuthToken() {
  const c = readGithubRunnerConfig();
  if (c.runnerToken) return c.runnerToken;
  if (!(c.appId && c.appPrivateKey && c.installationId)) { const e = new Error("missing_server_config"); e.code = "missing_server_config"; throw e; }
  const now = Math.floor(Date.now() / 1000);
  const header = b64urlJson({ alg: "RS256", typ: "JWT" });
  const payload = b64urlJson({ iat: now - 60, exp: now + 540, iss: c.appId });
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`); signer.end();
  const signature = signer.sign(c.appPrivateKey.replace(/\\n/g, "\n")).toString("base64url");
  const jwt = `${header}.${payload}.${signature}`;
  const installRes = await fetch(`https://api.github.com/app/installations/${encodeURIComponent(c.installationId)}/access_tokens`, { method: "POST", headers: { Authorization: `Bearer ${jwt}`, Accept: "application/vnd.github+json", "User-Agent": "wellfit-agent-runner" } });
  if (!installRes.ok) throw new Error(`github_auth_failed:${installRes.status}`);
  const body = await installRes.json();
  if (!body || !body.token) throw new Error("github_auth_failed");
  return body.token;
}
async function githubRequest(method, path, body) {
  const token = await getGithubAuthToken();
  const url = `https://api.github.com${path}`;
  const res = await fetch(url, { method, headers: { Authorization: `token ${token}`, Accept: "application/vnd.github+json", "Content-Type": "application/json", "User-Agent": "wellfit-agent-runner" }, body: body ? JSON.stringify(body) : undefined });
  const raw = await res.text(); let data = null; try { data = raw ? JSON.parse(raw) : null; } catch { data = { message: raw }; }
  if (!res.ok) { const err = new Error(data && data.message ? data.message : `github_request_failed_${res.status}`); err.status = res.status; err.data = data; throw err; }
  return data;
}
async function getBaseBranchRef(baseBranch) { const { owner, repo } = getRepoConfig(); return githubRequest("GET", `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(baseBranch)}`); }
async function createGithubBranch({ branchName, baseBranch }) { const { owner, repo } = getRepoConfig(); const base = await getBaseBranchRef(baseBranch); return githubRequest("POST", `/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branchName}`, sha: base.object.sha }); }
async function getGithubFile({ path, branchName }) { const { owner, repo } = getRepoConfig(); return githubRequest("GET", `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branchName)}`); }
async function putGithubFile({ path, content, branchName, message, sha }) { const { owner, repo } = getRepoConfig(); const body = { message, content: Buffer.from(content, "utf8").toString("base64"), branch: branchName }; if (sha) body.sha = sha; return githubRequest("PUT", `/repos/${owner}/${repo}/contents/${path}`, body); }
async function createGithubPullRequest({ branchName, baseBranch, title, body }) { const { owner, repo } = getRepoConfig(); return githubRequest("POST", `/repos/${owner}/${repo}/pulls`, { title, head: branchName, base: baseBranch, body }); }
async function getGithubPullRequest({ prNumber }) { const { owner, repo } = getRepoConfig(); return githubRequest("GET", `/repos/${owner}/${repo}/pulls/${prNumber}`); }
async function listGithubCheckRunsOrCommitStatuses({ ref }) { const { owner, repo } = getRepoConfig(); const checks = await githubRequest("GET", `/repos/${owner}/${repo}/commits/${ref}/check-runs`); const statuses = await githubRequest("GET", `/repos/${owner}/${repo}/commits/${ref}/status`); return { checks, statuses }; }
async function mergeGithubPullRequest({ prNumber, mergeMethod }) { const { owner, repo } = getRepoConfig(); return githubRequest("PUT", `/repos/${owner}/${repo}/pulls/${prNumber}/merge`, { merge_method: mergeMethod || "squash" }); }

module.exports = { readGithubRunnerConfig, isProtectedBranchName, hasGithubServerConfig, githubApiImplementationAvailable, buildGithubRunnerCapability, getGithubAuthToken, githubRequest, getRepoConfig, getBaseBranchRef, createGithubBranch, getGithubFile, putGithubFile, createGithubPullRequest, getGithubPullRequest, listGithubCheckRunsOrCommitStatuses, mergeGithubPullRequest };
