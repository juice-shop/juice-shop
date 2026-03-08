#!/usr/bin/env bash
set -euo pipefail

URL="${1:?URL is required}"
TIMEOUT_SECONDS="${2:-120}"
SLEEP_SECONDS="${3:-5}"
DEADLINE=$((SECONDS + TIMEOUT_SECONDS))

echo "Waiting for ${URL} (${TIMEOUT_SECONDS}s timeout)..."

until curl --silent --show-error --fail "${URL}" > /dev/null; do
  if [ "${SECONDS}" -ge "${DEADLINE}" ]; then
    echo "Timed out waiting for ${URL}"
    exit 1
  fi
  sleep "${SLEEP_SECONDS}"
done

echo "Service is reachable at ${URL}"
