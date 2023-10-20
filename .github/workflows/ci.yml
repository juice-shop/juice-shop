name: "CI/CD Pipeline"
on:
  push:
    branches-ignore:
      - l10n_develop
      - gh-pages
    paths-ignore:
      - '*.md'
      - 'LICENSE'
      - 'monitoring/grafana-dashboard.json'
      - 'screenshots/**'
    tags-ignore:
      - '*'
  pull_request:
    paths-ignore:
      - '*.md'
      - 'LICENSE'
      - 'data/static/i18n/*.json'
      - 'frontend/src/assets/i18n/*.json'
env:
  ANGULAR_CLI_VERSION: 15
  CYCLONEDX_NPM_VERSION: '^1.12.0'
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js 18"
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: 18
      - name: "Install CLI tools"
        run: npm install -g @angular/cli@$ANGULAR_CLI_VERSION
      - name: "Install application minimalistically"
        run: |
          npm install --ignore-scripts
          cd frontend
          npm install --ignore-scripts --legacy-peer-deps
      - name: "Lint source code"
        run: npm run lint
      - name: "Lint customization configs"
        run: >
          npm run lint:config -- -f ./config/7ms.yml &&
          npm run lint:config -- -f ./config/addo.yml &&
          npm run lint:config -- -f ./config/bodgeit.yml &&
          npm run lint:config -- -f ./config/ctf.yml &&
          npm run lint:config -- -f ./config/default.yml &&
          npm run lint:config -- -f ./config/fbctf.yml &&
          npm run lint:config -- -f ./config/juicebox.yml &&
          npm run lint:config -- -f ./config/mozilla.yml &&
          npm run lint:config -- -f ./config/oss.yml &&
          npm run lint:config -- -f ./config/quiet.yml &&
          npm run lint:config -- -f ./config/tutorial.yml &&
          npm run lint:config -- -f ./config/unsafe.yml
  coding-challenge-rsn:
    runs-on: windows-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js 18"
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: 18
      - name: "Install CLI tools"
        run: npm install -g @angular/cli@$ANGULAR_CLI_VERSION
      - name: "Install application"
        run: npm install
      - name: "Check coding challenges for accidental code discrepancies"
        run: npm run rsn
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest] # FIXME: Removed "windows-latest" due to 'Error: ENOENT: no such file or directory, open' error breaking at least on Node 20.0 constantly
        node-version: [16, 18, 20]
    steps:
      - name: "Check out Git repository"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js ${{ matrix.node-version }}"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: ${{ matrix.node-version }}
      - name: "Install CLI tools"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        run: npm install -g @angular/cli@$ANGULAR_CLI_VERSION
      - name: "Install application"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        run: npm install
      - name: "Execute unit tests"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: nick-invision/retry@943e742917ac94714d2f408a0e8320f2d1fcafcd #v2.8.3
        with:
          timeout_minutes: 15
          max_attempts: 3
          command: npm test
      - name: "Copy unit test coverage data"
        run: |
          cp build/reports/coverage/frontend-tests/lcov.info frontend-lcov.info
          cp build/reports/coverage/server-tests/lcov.info server-lcov.info
      - name: "Upload unit test coverage data"
        if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18'
        uses: actions/upload-artifact@a8a3f3ad30e3422c9c7b888a15615d19a852ae32 #v3.1.3
        with:
          name: unit-test-lcov
          path: |
            frontend-lcov.info
            server-lcov.info
  api-test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [16, 18, 20]
    steps:
      - name: "Check out Git repository"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js ${{ matrix.node-version }}"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: ${{ matrix.node-version }}
      - name: "Install CLI tools"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        run: npm install -g @angular/cli@$ANGULAR_CLI_VERSION
      - name: "Install application"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        run: npm install
      - name: "Execute integration tests"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        uses: nick-invision/retry@943e742917ac94714d2f408a0e8320f2d1fcafcd #v2.8.3
        env:
          NODE_ENV: test
        with:
          timeout_minutes: 5
          max_attempts: 3
          command: npm run frisby
      - name: "Copy API test coverage data"
        run: cp build/reports/coverage/api-tests/lcov.info api-lcov.info
      - name: "Upload API test coverage data"
        if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18'
        uses: actions/upload-artifact@a8a3f3ad30e3422c9c7b888a15615d19a852ae32 #v3.1.3
        with:
          name: api-test-lcov
          path: |
            api-lcov.info
  coverage-report:
    needs: [test, api-test]
    runs-on: ubuntu-latest
    if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push'
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Download unit test coverage data"
        uses: actions/download-artifact@9bc31d5ccc31df68ecc42ccf4149144866c47d8a #v3.0.2
        with:
          name: unit-test-lcov
      - name: "Download API test coverage data"
        uses: actions/download-artifact@9bc31d5ccc31df68ecc42ccf4149144866c47d8a #v3.0.2
        with:
          name: api-test-lcov
      - name: "Publish coverage to Codeclimate"
        env:
          CC_TEST_REPORTER_ID: ${{ secrets.CC_TEST_REPORTER_ID }}
        run: |
          curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
          chmod +x ./cc-test-reporter
          sed -i s/SF:/SF:frontend\\//g frontend-lcov.info
          ./cc-test-reporter format-coverage -t lcov -o codeclimate.frontend.json frontend-lcov.info
          ./cc-test-reporter format-coverage -t lcov -o codeclimate.server.json server-lcov.info
          ./cc-test-reporter format-coverage -t lcov -o codeclimate.api.json api-lcov.info
          ./cc-test-reporter sum-coverage codeclimate.*.json -p 3
          ./cc-test-reporter upload-coverage
        shell: bash
  custom-config-test:
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js 18"
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: 18
      - name: "Install CLI tools"
        run: npm install -g @angular/cli@$ANGULAR_CLI_VERSION
      - name: "Install application"
        if: github.repository == 'juice-shop/juice-shop' || (github.repository != 'juice-shop/juice-shop' && matrix.os == 'ubuntu-latest' && matrix.node-version == '18')
        run: npm install
      - name: "Execute server tests for each custom configuration"
        uses: nick-invision/retry@943e742917ac94714d2f408a0e8320f2d1fcafcd #v2.8.3
        with:
          timeout_minutes: 10
          max_attempts: 3
          command: >
            NODE_ENV=7ms npm run test:server &&
            NODE_ENV=addo npm run test:server &&
            NODE_ENV=bodgeit npm run test:server &&
            NODE_ENV=ctf npm run test:server &&
            NODE_ENV=fbctf npm run test:server &&
            NODE_ENV=juicebox npm run test:server &&
            NODE_ENV=mozilla npm run test:server &&
            NODE_ENV=oss npm run test:server &&
            NODE_ENV=quiet npm run test:server &&
            NODE_ENV=tutorial npm run test:server &&
            NODE_ENV=unsafe npm run test:server
  e2e:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        browser: [chrome] # FIXME Switch back to [chrome, firefox] after debugging extreme flakiness of Firefox on CI/CD
      fail-fast: false
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js 18"
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: 18
      - name: "Install CLI tools"
        run: npm install -g @angular/cli
      - name: "Install application"
        run: npm install
      - name: "Execute end-to-end tests on Ubuntu"
        if: ${{ matrix.os == 'ubuntu-latest' }}
        uses: cypress-io/github-action@59810ebfa5a5ac6fcfdcfdf036d1cd4d083a88f2 #v6.5.0
        with:
          install: false
          browser: ${{ matrix.browser }}
          start: npm start
          wait-on: http://localhost:3000
          record: true
          group: ${{ matrix.browser }} @ ${{ matrix.os }}
        env:
          SOLUTIONS_WEBHOOK: ${{ secrets.E2E_SOLUTIONS_WEBHOOK }}
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      - name: "Execute end-to-end tests on Mac"
        if: ${{ matrix.os == 'macos-latest' }}
        uses: cypress-io/github-action@59810ebfa5a5ac6fcfdcfdf036d1cd4d083a88f2 #v6.5.0
        with:
          install: false
          browser: ${{ matrix.browser }}
          start: npm start
          wait-on: http://localhost:3000
          record: true
          group: ${{ matrix.browser }} @ ${{ matrix.os }}
        env:
          CYPRESS_CACHE_FOLDER: /Users/runner/Library/Caches/Cypress
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Use Node.js 18"
        uses: actions/setup-node@5e21ff4d9bc1a8cf6de233a3057d20ec6b3fb69d #v3.8.1
        with:
          node-version: 18
      - name: "Install CLI tools"
        run: |
          npm install -g @angular/cli@$ANGULAR_CLI_VERSION
          npm install -g @cyclonedx/cyclonedx-npm@$CYCLONEDX_NPM_VERSION
          npm install -g grunt-cli
      - name: "Set packaging options for Grunt"
        run: |
          echo "PCKG_OS_NAME=linux" >> $GITHUB_ENV
          echo "PCKG_NODE_VERSION=18" >> $GITHUB_ENV
          echo "PCKG_CPU_ARCH=x64" >> $GITHUB_ENV
      - name: "Package application"
        run: |
          npm install --production
          npm run package:ci
      - name: "Unpack application archive"
        run: |
          cd dist
          tar -zxf juice-shop-*.tgz
      - name: "Execute smoke test"
        run: |
          cd dist/juice-shop_*
          npm start &
          cd ../..
          chmod +x test/smoke/smoke-test.sh
          test/smoke/smoke-test.sh http://localhost:3000
  docker-test:
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Execute smoke test on Docker"
        run: docker-compose -f docker-compose.test.yml up --exit-code-from sut
  docker:
    if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push' && (github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/master')
    needs: [test, api-test, e2e, custom-config-test, docker-test]
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Set up QEMU"
        uses: docker/setup-qemu-action@68827325e0b33c7199eb31dd4e31fbe9023e06e3 #v3.0.0
      - name: "Set up Docker Buildx"
        uses: docker/setup-buildx-action@f95db51fddba0c2d1ec667646a06c2ce06100226 #v3.0.0
      - name: "Login to DockerHub"
        uses: docker/login-action@343f7c4344506bcbf9b4de18042ae17996df046d #v3.0.0
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: "Set tag & labels for ${{ github.ref }}"
        run: |
          if [ "$GITHUB_REF" == "refs/heads/master" ]; then
          echo "DOCKER_TAG=latest" >> $GITHUB_ENV
          else
          echo "DOCKER_TAG=snapshot" >> $GITHUB_ENV
          fi
          echo "VCS_REF=`git rev-parse --short HEAD`" >> $GITHUB_ENV
          echo "BUILD_DATE=`date -u +”%Y-%m-%dT%H:%M:%SZ”`" >> $GITHUB_ENV
      - name: "Build and push for AMD64 and ARM64 processors"
        uses: docker/build-push-action@0565240e2d4ab88bba5387d719585280857ece09 #v5.0.0
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            bkimminich/juice-shop:${{ env.DOCKER_TAG }}
          build-args: |
            VCS_REF=${{ env.VCS_REF }}
            BUILD_DATE=${{ env.BUILD_DATE }}
            CYCLONEDX_NPM_VERSION=${{ env.CYCLONEDX_NPM_VERSION }}
  heroku:
    if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push' && (github.ref == 'refs/heads/develop' || github.ref == 'refs/heads/master')
    needs: [test, api-test, e2e, custom-config-test]
    runs-on: ubuntu-latest
    steps:
      - name: "Check out Git repository"
        uses: actions/checkout@3df4ab11eba7bda6032a0b82a6bb43b11571feac #v4.0.0
      - name: "Set Heroku app & branch for ${{ github.ref }}"
        run: |
          if [ "$GITHUB_REF" == "refs/heads/master" ]; then
          echo "HEROKU_APP=juice-shop" >> $GITHUB_ENV
          echo "HEROKU_BRANCH=master" >> $GITHUB_ENV
          else
          echo "HEROKU_APP=juice-shop-staging" >> $GITHUB_ENV
          echo "HEROKU_BRANCH=develop" >> $GITHUB_ENV
          fi
      - name: "Deploy ${{ github.ref }} to Heroku"
        uses: akhileshns/heroku-deploy@9fd0f9faae4aa93a38d6f5e25b9128589f1371b0 #v3.12.14
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ env.HEROKU_APP }}
          heroku_email: bjoern.kimminich@owasp.org
          branch: ${{ env.HEROKU_BRANCH }}
  notify-slack:
    if: github.repository == 'juice-shop/juice-shop' && github.event_name == 'push' && (success() || failure())
    needs:
      - docker
      - heroku
      - lint
      - coding-challenge-rsn
      - smoke-test
      - coverage-report
    runs-on: ubuntu-latest
    steps:
      - name: "Slack workflow notification"
        uses: Gamesight/slack-workflow-status@26a36836c887f260477432e4314ec3490a84f309 #v1.2.0
        with:
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          slack_webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
