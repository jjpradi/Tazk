#!/usr/bin/env bash
# Package a finding + its referenced evidence into a single zip for handoff.
#
# Usage:
#   ./findings/bundle.sh <slug>
#
# Where <slug> matches a file in findings/ — either the full filename or
# just the suffix after the date. Examples:
#   ./findings/bundle.sh 2026-04-13-purchase-return
#   ./findings/bundle.sh purchase-return      # will match today's date
#
# Produces: finding-<slug>.zip at repo root.

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "usage: $0 <slug>" >&2
    exit 1
fi

slug="$1"
here="$(cd "$(dirname "$0")" && pwd)"
repo="$(cd "$here/.." && pwd)"
cd "$repo"

# Resolve the finding file.
finding=""
if [[ -f "findings/$slug.md" ]]; then
    finding="findings/$slug.md"
elif [[ -f "findings/$slug" ]]; then
    finding="findings/$slug"
else
    # Try today's date prefix.
    today="$(date +%Y-%m-%d)"
    candidate="findings/$today-$slug.md"
    if [[ -f "$candidate" ]]; then
        finding="$candidate"
    else
        # Fuzzy match: anything in findings/ containing the slug.
        matches=$(find findings -maxdepth 1 -type f -name "*$slug*.md" 2>/dev/null || true)
        count=$(echo "$matches" | grep -c . || true)
        if [[ "$count" -eq 1 ]]; then
            finding="$matches"
        elif [[ "$count" -gt 1 ]]; then
            echo "multiple findings match '$slug':" >&2
            echo "$matches" >&2
            exit 2
        else
            echo "no finding matching '$slug' in findings/" >&2
            exit 3
        fi
    fi
fi

echo "finding: $finding"

# Extract evidence paths referenced in the finding. We look for lines mentioning
# findings/evidence/... or similar. This is a best-effort grep — missing files
# are warned but don't block the bundle.
evidence_paths=()
while IFS= read -r line; do
    path="$(echo "$line" | grep -oE '(findings/evidence/[^ )\`\"'\'']+|evidence/[^ )\`\"'\'']+)' | head -1 || true)"
    if [[ -n "$path" ]]; then
        # Normalise to a repo-relative path.
        if [[ "$path" != findings/* ]]; then
            path="findings/$path"
        fi
        evidence_paths+=("$path")
    fi
done < "$finding"

# De-dupe.
evidence_paths=($(printf '%s\n' "${evidence_paths[@]}" | awk '!seen[$0]++'))

zip_name="finding-$(basename "$finding" .md).zip"
rm -f "$zip_name"

zip -q "$zip_name" "$finding"
for p in "${evidence_paths[@]}"; do
    if [[ -f "$p" ]]; then
        zip -q "$zip_name" "$p"
        echo "  + $p"
    else
        echo "  (missing) $p" >&2
    fi
done

echo "bundled: $zip_name"
