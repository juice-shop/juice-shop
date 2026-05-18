#!/usr/bin/env bash
set -euo pipefail

workspace="/workspaces/juice-shop-appsec-assessment"

sudo chown -R node:node "$workspace"

cd "$workspace"

manifest_signature() {
  local manifest="$1"

  printf '%s:node-abi-%s\n' "$(sha256sum "$manifest" | awk '{print $1}')" "$(node -p 'process.versions.modules')"
}

clean_node_modules_if_stale() {
  local manifest="$1"
  local modules_dir="$2"
  local marker="$modules_dir/.devcontainer-install-signature"
  local current_signature

  current_signature="$(manifest_signature "$manifest")"

  if [[ -f "$marker" ]] && [[ "$(cat "$marker")" == "$current_signature" ]]; then
    return
  fi

  mkdir -p "$modules_dir"
  find "$modules_dir" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
}

write_install_signature() {
  local manifest="$1"
  local modules_dir="$2"

  mkdir -p "$modules_dir"
  manifest_signature "$manifest" > "$modules_dir/.devcontainer-install-signature"
}

clean_node_modules_if_stale "$workspace/package.json" "$workspace/node_modules"
clean_node_modules_if_stale "$workspace/frontend/package.json" "$workspace/frontend/node_modules"

npm install

write_install_signature "$workspace/package.json" "$workspace/node_modules"
write_install_signature "$workspace/frontend/package.json" "$workspace/frontend/node_modules"
