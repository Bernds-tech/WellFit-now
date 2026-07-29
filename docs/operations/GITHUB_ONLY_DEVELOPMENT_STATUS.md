# WellFit GitHub-managed staging development status

Stand: 2026-07-29

Current operating mode: branch/PR development with automatic Docker staging deployment.

- Canonical repository: `Bernds-tech/WellFit-now`
- Staging: `http://172.86.88.107`
- Release trigger: push/merge to `main` through `.github/workflows/deploy.yml`
- Runtime: standalone Next.js container behind Nginx
- Activation: checksummed image transfer, candidate health check and rollback through `infra/server/deploy-wellfit.sh`
- Current verified release: `c0ef7d921ee1499cd20ffdd086ebca4050f1a189`
- Production status: not production-ready or production-approved

## Operating rules

- All repository changes use a scoped branch and pull request; never write directly to `main`.
- Treat a merge to `main` as an external staging deployment.
- Do not make undocumented manual server changes that drift from repository configuration.
- Do not deploy unrelated products or external services from WellFit workflows.
- Firebase Functions/Rules/Data deployment, production hosting, secrets, domain/TLS and infrastructure changes require their own explicit scope and evidence.
- Preserve rollback, health checks and release-SHA traceability.

## Current gaps

- staging is HTTP on a direct IP,
- domain and TLS are missing,
- browser security headers are incomplete,
- `robots.txt`, `sitemap.xml` and `security.txt` are missing,
- Firebase Functions and Rules deployment versions were not verified by the 2026-07-29 repository/runtime audit,
- no production approval is implied.

See `docs/status/WELLFIT_RUNTIME_STATE_2026-07-29.md` and `todolist/CURRENT_EXECUTION_BOARD.md`.

## KI-Fortsetzungs-Prompt

Use GitHub branches and PRs for every change. Before merging, remember that `main` auto-deploys to staging. Keep server configuration reproducible in the repository, preserve health/rollback behavior and document the deployed SHA and live smoke result. Do not infer Firebase or production deployment from the web staging workflow.
