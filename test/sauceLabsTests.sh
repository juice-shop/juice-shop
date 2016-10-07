#!/usr/bin/env bash
if [ "$TRAVIS_NODE_VERSION" == "4" ]; then
    if [ "$TRAVIS_PULL_REQUEST" == "false" -o "$TRAVIS_BRANCH" == "master" -a "$TRAVIS_PULL_REQUEST" != "false" ]; then
        echo -e "'\033[1;33m'Running unit tests on SauceLabs...'\033[0m'"
        karma start karma.conf-ci.js
        echo -e "'\033[1;33m'Running e2e tests on SauceLabs...'\033[0m'"
        npm run protractor
    else
        echo -e "'\033[0;33m'Skipping SauceLabs tests for PR #$TRAVIS_PULL_REQUEST onto $TRAVIS_BRANCH branch (only executed for PRs onto master)'\033[0m'"
    fi
  else
    echo -e "'\033[0;33m'Skipping SauceLabs tests for Node.js v$TRAVIS_NODE_VERSION (only executed on v4)'\033[0m'"
  fi