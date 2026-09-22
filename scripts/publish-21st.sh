#!/usr/bin/env bash
# Publish (or re-publish) every form to the 21st.dev mirror library `vizcn`.
# Prereq: `pnpm 21st:build`, and a 21st session (`npx @21st-dev/cli login`).
# Usage: scripts/publish-21st.sh [name ...]   (no args = every form in the manifest)
set -euo pipefail
cd "$(dirname "$0")/.."
DIST=dist/21st
LIB=${TWENTYFIRST_LIBRARY:-vizcn}
SHELF=$(node -p "require('./registry.config.json').shelfUrl")
EXTRA=${TWENTYFIRST_PUBLISH_ARGS:-}   # e.g. "--component component:<id>" for a revision
names=("$@")
if [ ${#names[@]} -eq 0 ]; then
  while IFS= read -r n; do names+=("$n"); done < <(node -p "require('./$DIST/manifest.json').map(m => m.name).join('\n')")
fi
for n in "${names[@]}"; do
  title=$(node -p "require('./$DIST/manifest.json').find(m => m.name === '$n').title")
  desc=$(node -p "require('./$DIST/manifest.json').find(m => m.name === '$n').description")
  family=$(node -p "require('./$DIST/manifest.json').find(m => m.name === '$n').family")
  echo "=== $n ($title)"
  (cd "$DIST/$n" && npx -y @21st-dev/cli publish "./$n.tsx" --demo "./$n.demo.tsx" \
    --name "$title" --slug "$n" --description "$desc" --to "$LIB" --website "$SHELF" \
    --tags "chart,data-viz,svg,$family,vizcn" --auto --no-open --json $EXTRA)
done
