#!/usr/bin/env bash
set -euo pipefail

workspace="/workspaces/juice-shop-appsec-assessment"

sudo mkdir -p \
  "$workspace/node_modules" \
  "$workspace/frontend/node_modules" \
  "$workspace/build" \
  "$workspace/frontend/dist"

sudo chown -R node:node \
  "$workspace/node_modules" \
  "$workspace/frontend/node_modules" \
  "$workspace/build" \
  "$workspace/frontend/dist"

npm install
