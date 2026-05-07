# WellFit Dev Agent - local watcher
# Start this from the repository root: C:\wellfit\WellFit-now
# It watches relevant project-memory and agent files and runs the full agent gate after changes.

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

$watchPaths = @(
  "todolist",
  "docs\architecture",
  "scripts\wellfit-dev-agent",
  ".github\workflows"
)

$rootFiles = @(
  "package.json",
  "package-lock.json",
  "next.config.js",
  "next.config.mjs",
  "tsconfig.json",
  "firebase.json",
  "firestore.rules"
)

$lastRun = Get-Date "2000-01-01"
$debounceSeconds = 10
$isRunning = $false
$pending = $false

function Write-Log($message) {
  $line = "[$(Get-Date -Format o)] $message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line
}

function Invoke-AgentRun($reason) {
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

  Register-ObjectEvent $watcher Changed -Action { Invoke-AgentRun "Changed: $($Event.SourceEventArgs.FullPath)" } | Out-Null
  Register-ObjectEvent $watcher Created -Action { Invoke-AgentRun "Created: $($Event.SourceEventArgs.FullPath)" } | Out-Null
  Register-ObjectEvent $watcher Renamed -Action { Invoke-AgentRun "Renamed: $($Event.SourceEventArgs.FullPath)" } | Out-Null
  Register-ObjectEvent $watcher Deleted -Action { Invoke-AgentRun "Deleted: $($Event.SourceEventArgs.FullPath)" } | Out-Null

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
