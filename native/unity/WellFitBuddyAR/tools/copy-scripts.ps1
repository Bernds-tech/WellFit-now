# WellFitBuddyAR - Copy Unity C# templates
# Run from repository root or from native/unity/WellFitBuddyAR.

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Resolve-Path (Join-Path $scriptDir "..")
$sourceDir = Join-Path $projectRoot "Scripts"
$targetDir = Join-Path $projectRoot "Assets\Scripts"

if (!(Test-Path $sourceDir)) {
  throw "Source directory not found: $sourceDir"
}

if (!(Test-Path $targetDir)) {
  New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

Get-ChildItem -Path $sourceDir -Filter "*.cs.txt" | ForEach-Object {
  $targetName = $_.Name -replace "\.cs\.txt$", ".cs"
  $targetPath = Join-Path $targetDir $targetName
  Copy-Item -Path $_.FullName -Destination $targetPath -Force
  Write-Host "Copied $($_.Name) -> Assets/Scripts/$targetName"
}

$staleEvents = @(
  "onBuddyGuideContextUpdated",
  "onBuddyGuideStepExplained",
  "onBuddyGuideContextCleared",
  "onBuddyDialogueCleared"
)

foreach ($staleEvent in $staleEvents) {
  $matches = Get-ChildItem -Path $targetDir -Filter "*.cs" -Recurse | Select-String -Pattern $staleEvent -SimpleMatch
  if ($matches) {
    Write-Error "Stale AR event contract name found after copy: $staleEvent`n$($matches | Out-String)"
  }
}

Write-Host "WellFitBuddyAR script copy complete. Event contract audit passed. Open Unity and let it compile."
