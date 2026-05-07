# WellFit Dev Agent - full local run
# Run this from the repository root, where package.json is located.

$ErrorActionPreference = "Stop"

Write-Host "=== WellFit Dev Agent: validate ==="
npm run agent:validate

Write-Host "=== WellFit Dev Agent: goal-check ==="
npm run agent:goal-check

Write-Host "=== WellFit Dev Agent: memory-sync ==="
npm run agent:memory-sync

Write-Host "=== WellFit Dev Agent: coder-prompts ==="
npm run agent:coder-prompts

Write-Host "=== WellFit Dev Agent: dry-run ==="
npm run agent:dry-run

Write-Host "=== WellFit Dev Agent: quality-gate ==="
npm run agent:quality-gate

Write-Host "=== Done ==="
Write-Host "Check outputs:"
Write-Host "scripts/wellfit-dev-agent/output/alpha-goal-check.md"
Write-Host "scripts/wellfit-dev-agent/output/memory-sync-report.md"
Write-Host "scripts/wellfit-dev-agent/output/dry-run-report.md"
Write-Host "scripts/wellfit-dev-agent/output/quality-gate-report.md"
Write-Host "scripts/wellfit-dev-agent/output/coder-prompts/"
