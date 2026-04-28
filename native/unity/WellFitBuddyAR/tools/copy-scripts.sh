#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_DIR="$PROJECT_ROOT/Scripts"
TARGET_DIR="$PROJECT_ROOT/Assets/Scripts"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

shopt -s nullglob
for source_file in "$SOURCE_DIR"/*.cs.txt; do
  file_name="$(basename "$source_file")"
  target_name="${file_name%.cs.txt}.cs"
  cp "$source_file" "$TARGET_DIR/$target_name"
  echo "Copied $file_name -> Assets/Scripts/$target_name"
done

STALE_EVENTS=(
  "onBuddyGuideContextUpdated"
  "onBuddyGuideStepExplained"
  "onBuddyGuideContextCleared"
  "onBuddyDialogueCleared"
)

for stale_event in "${STALE_EVENTS[@]}"; do
  if grep -R --line-number "$stale_event" "$TARGET_DIR" >/dev/null 2>&1; then
    echo "Stale AR event contract name found after copy: $stale_event" >&2
    grep -R --line-number "$stale_event" "$TARGET_DIR" >&2 || true
    exit 1
  fi
done

echo "WellFitBuddyAR script copy complete. Event contract audit passed. Open Unity and let it compile."
