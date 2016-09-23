#!/usr/bin/env bash
echo "Running unit tests on SauceLabs..."
karma start karma.conf-ci.js
echo "Running e2e tests on SauceLabs..."
npm run protractor