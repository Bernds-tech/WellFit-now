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

echo "WellFitBuddyAR script copy complete. Open Unity and let it compile."
