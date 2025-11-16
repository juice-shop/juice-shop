#!/bin/sh

#
# Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
# SPDX-License-Identifier: MIT
#

printf "Waiting 20sec for %s to launch" "$1"
sleep 5
printf "....."
sleep 5
printf "....."
sleep 5
printf "....."
sleep 5
printf ".....\n"
printf "Running smoke tests...\n"

EXIT=0
if curl "$1" -s | grep -q '<app-root></app-root>'; then
  printf "\033[0;32mIndex smoke test passed!\033[0m\n"
else
  printf "\033[0;31mIndex smoke test failed!\033[0m\n"
  EXIT=$((EXIT+1))
fi

if curl "$1/api/Challenges" -s | grep -q '"status":"success"'; then
  printf "\033[0;32mAPI smoke test passed!\033[0m\n"
else
  printf "\033[0;31mAPI smoke test failed!\033[0m\n"
  EXIT=$((EXIT+1))
fi

if curl "$1/main.js" -s | grep -q 'applicationName="OWASP Juice Shop"'; then
  printf "\033[0;32mAngular smoke test passed!\033[0m\n"
else
  printf "\033[0;31mAngular smoke test failed!\033[0m\n"
  EXIT=$((EXIT+1))
fi

if curl "$1/snippets/directoryListingChallenge" -s | grep -q 'serveIndexMiddleware'; then
  printf "\033[0;32mCode snippet smoke test passed!\033[0m\n"
else
  printf "\033[0;31mCode snippet smoke test failed!\033[0m\n"
  EXIT=$((EXIT+1))
fi

printf "Smoke tests exiting with code %s (" "$EXIT"
if [ $EXIT -gt 0 ]; then
  printf "\033[0;31mFAILED\033[0m)\n"
else
  printf "\033[0;32mSUCCESS\033[0m)\n"
fi
exit $EXIT
