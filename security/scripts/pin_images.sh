#!/usr/bin/env bash
# Replace the base-image tags in security/Dockerfile.hardened with immutable @sha256 digests.
# A tag can be re-pointed by whoever controls the registry; a digest cannot.
#   bash security/scripts/pin_images.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
F=security/Dockerfile.hardened
for img in $(grep -E '^FROM ' "$F" | awk '{print $2}' | grep -v '@sha256'); do
  digest=$(docker buildx imagetools inspect "$img" --format '{{json .Manifest.Digest}}' | tr -d '"')
  echo "$img -> $img@$digest"
  sed -i.bak "s#^FROM $img#FROM $img@$digest#" "$F"
done
rm -f "$F.bak"
git diff --stat "$F"
