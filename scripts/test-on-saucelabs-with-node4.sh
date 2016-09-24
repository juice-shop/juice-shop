#!/usr/bin/env bash
if [ "$TRAVIS_NODE_VERSION" == "4" ]; then
    echo "Running unit tests on SauceLabs..."
    karma start karma.conf-ci.js
    echo "Running e2e tests on SauceLabs..."
    npm run protractor
  else
    echo "Skipping SauceLabs tests for Node.js v" + "$TRAVIS_NODE_VERSION" + " (only executed on v4 for performance reasons)"
  fi