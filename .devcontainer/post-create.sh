#!/usr/bin/env bash
set -euo pipefail

workspace="/workspaces/juice-shop-appsec-assessment"

sudo chown -R node:node "$workspace"

npm install
