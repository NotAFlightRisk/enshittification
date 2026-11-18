#!/usr/bin/env bash
# Commits whichever of the given paths changed straight to main through the contents API, one
# file at a time, so the commit is made (and signed) by whoever owns GH_TOKEN
set -euo pipefail

message=$1
shift
mapfile -t files < <(git diff --name-only -- "$@")
for file in "${files[@]}"; do
  sha=$(gh api "repos/$GITHUB_REPOSITORY/contents/$file?ref=main" --jq .sha)
  base64 -w0 "$file" > "$RUNNER_TEMP/content"
  gh api -X PUT "repos/$GITHUB_REPOSITORY/contents/$file" \
    -f message="$message" -f branch=main -f sha="$sha" -F content=@"$RUNNER_TEMP/content" \
    --jq '"✅ [\(.commit.sha[:7])](\(.commit.html_url)) \(.content.path)"'
done
[ ${#files[@]} -gt 0 ] || echo "Nothing changed"
