#!/usr/bin/env bash
if [ "$TRAVIS_NODE_VERSION" == "4" ]; then
    if [ "$TRAVIS_PULL_REQUEST" == "false" ] || [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
        echo "Running unit tests on SauceLabs..."
        karma start karma.conf-ci.js
        echo "Running e2e tests on SauceLabs..."
        npm run protractor
    else
        echo "Skipping SauceLabs tests for PR #$TRAVIS_PULL_REQUEST onto $TRAVIS_BRANCH branch (only executed for PRs onto master)"
    fi
  else
    echo "Skipping SauceLabs tests for Node.js v$TRAVIS_NODE_VERSION (only executed on v4)"
  fi