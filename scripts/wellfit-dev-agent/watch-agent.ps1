# WellFit Dev Agent - local watcher
# Start this from the repository root: C:\wellfit\WellFit-now
# It watches relevant project-memory, app, backend, Unity and agent source files and runs the full agent gate after changes.

$ErrorActionPreference = "Stop"

$Root = (Get-Location).Path
$RunScript = Join-Path $Root "scripts\wellfit-dev-agent\run-agent-full.ps1"
$OutputDir = Join-Path $Root "scripts\wellfit-dev-agent\output"
$LogFile = Join-Path $OutputDir "watch-agent.log"

if (!(Test-Path $RunScript)) {
  Write-Host "ERROR: run-agent-full.ps1 not found. Start this script from repository root." -ForegroundColor Red
  exit 1
}

if (!(Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# Watch only meaningful source/project-memory areas.
# Do not watch output/build/cache folders, otherwise the agent can trigger itself.
$watchPaths = @(
  "app",
  "components",
  "lib",
  "functions",
  "native\unity\WellFitBuddyAR\Assets\Scripts",
  "native\unity\WellFitBuddyAR\docs",
  "native\unity\WellFitBuddyAR\tools",
  "public",
  "todolist",
  "docs\architecture",
  "scripts\wellfit-dev-agent\src",
  ".github\workflows"
)

$rootFiles = @(
  "package.json",
  "package-lock.json",
  "next.config.js",
  "next.config.mjs",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
  "firebase.json",
  "firestore.rules",
  ".firebaserc",
  ".env.example"
)

$lastRun = Get-Date "2000-01-01"
$debounceSeconds = 20
$isRunning = $false
$pending = $false

function Write-Log($message) {
  $line = "[$(Get-Date -Format o)] $message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line
}

function Should-IgnorePath($fullPath) {
  $normalized = $fullPath.Replace('/', '\')

  if ($normalized -like "*\scripts\wellfit-dev-agent\output\*") { return $true }
  if ($normalized -like "*\.git\*") { return $true }
  if ($normalized -like "*\.next\*") { return $true }
  if ($normalized -like "*\node_modules\*") { return $true }
  if ($normalized -like "*\dist\*") { return $true }
  if ($normalized -like "*\build\*") { return $true }
  if ($normalized -like "*\out\*") { return $true }
  if ($normalized -like "*\coverage\*") { return $true }
  if ($normalized -like "*\.turbo\*") { return $true }
  if ($normalized -like "*\.vercel\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Library\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Temp\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Logs\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Obj\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Build\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\Builds\*") { return $true }
  if ($normalized -like "*\native\unity\WellFitBuddyAR\UserSettings\*") { return $true }

  return $false
}

function Invoke-AgentRun($reason) {
  if ($reason -and (Should-IgnorePath $reason)) {
    return
  }

  if ($script:isRunning) {
    $script:pending = $true
    Write-Log "Agent already running; queued another run. Reason: $reason"
    return
  }

  $now = Get-Date
  if (($now - $script:lastRun).TotalSeconds -lt $script:debounceSeconds) {
    $script:pending = $true
    Write-Log "Change received during debounce window; queued run. Reason: $reason"
    return
  }

  $script:isRunning = $true
  $script:lastRun = $now
  $script:pending = $false

  try {
    Write-Log "Starting full agent run. Reason: $reason"
    powershell -ExecutionPolicy Bypass -File $RunScript
    if ($LASTEXITCODE -eq 0) {
      Write-Log "Agent run finished: PASS"
    } else {
      Write-Log "Agent run finished: FAIL exitCode=$LASTEXITCODE"
    }
  } catch {
    Write-Log "Agent run failed: $($_.Exception.Message)"
  } finally {
    $script:isRunning = $false
  }

  if ($script:pending) {
    Start-Sleep -Seconds $script:debounceSeconds
    Invoke-AgentRun "queued change after previous run"
  }
}

$watchers = @()

foreach ($relativePath in $watchPaths) {
  $absolutePath = Join-Path $Root $relativePath
  if (!(Test-Path $absolutePath)) {
    Write-Log "Skipping missing watch path: $relativePath"
    continue
  }

  $watcher = New-Object System.IO.FileSystemWatcher
  $watcher.Path = $absolutePath
  $watcher.IncludeSubdirectories = $true
  $watcher.EnableRaisingEvents = $true
  $watcher.Filter = "*.*"

  Register-ObjectEvent $watcher Changed -Action {
    $fullPath = $Event.SourceEventArgs.FullPath
    if (-not (Should-IgnorePath $fullPath)) { Invoke-AgentRun "Changed: $fullPath" }
  } | Out-Null
  Register-ObjectEvent $watcher Created -Action {
    $fullPath = $Event.SourceEventArgs.FullPath
    if (-not (Should-IgnorePath $fullPath)) { Invoke-AgentRun "Created: $fullPath" }
  } | Out-Null
  Register-ObjectEvent $watcher Renamed -Action {
    $fullPath = $Event.SourceEventArgs.FullPath
    if (-not (Should-IgnorePath $fullPath)) { Invoke-AgentRun "Renamed: $fullPath" }
  } | Out-Null
  Register-ObjectEvent $watcher Deleted -Action {
    $fullPath = $Event.SourceEventArgs.FullPath
    if (-not (Should-IgnorePath $fullPath)) { Invoke-AgentRun "Deleted: $fullPath" }
  } | Out-Null

  $watchers += $watcher
  Write-Log "Watching path: $relativePath"
}

foreach ($file in $rootFiles) {
  $absoluteFile = Join-Path $Root $file
  if (!(Test-Path $absoluteFile)) {
    continue
  }

  $parent = Split-Path $absoluteFile -Parent
  $leaf = Split-Path $absoluteFile -Leaf

  $watcher = New-Object System.IO.FileSystemWatcher
  $watcher.Path = $parent
  $watcher.Filter = $leaf
  $watcher.IncludeSubdirectories = $false
  $watcher.EnableRaisingEvents = $true

  Register-ObjectEvent $watcher Changed -Action { Invoke-AgentRun "Changed: $($Event.SourceEventArgs.FullPath)" } | Out-Null
  Register-ObjectEvent $watcher Created -Action { Invoke-AgentRun "Created: $($Event.SourceEventArgs.FullPath)" } | Out-Null
  Register-ObjectEvent $watcher Renamed -Action { Invoke-AgentRun "Renamed: $($Event.SourceEventArgs.FullPath)" } | Out-Null

  $watchers += $watcher
  Write-Log "Watching file: $file"
}

Write-Log "WellFit watch-agent started. Press Ctrl+C to stop."
Write-Log "Manual first run starts now."
Invoke-AgentRun "initial watcher startup"

while ($true) {
  Start-Sleep -Seconds 2
}
