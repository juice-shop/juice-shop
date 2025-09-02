{
  "name": "juice-shop",
  "version": "6.2.0-SNAPSHOT",
  "description": "An intentionally insecure JavaScript Web Application",
  "homepage": "http://owasp-juice.shop",
  "author": "Björn Kimminich <bjoern.kimminich@owasp.org> (https://kimminich.de)",
  "contributors": [
    "Björn Kimminich",
    "Jannik Hollenbach",
    "Aashish683",
    "greenkeeper[bot]",
    "MarcRler",
    "agrawalarpit14",
    "Scar26",
    "CaptainFreak",
    "Supratik Das",
    "JuiceShopBot",
    "the-pro",
    "Ziyang Li",
    "aaryan10",
    "m4l1c3",
    "Timo Pagel",
    "..."
  ],
  "private": true,
  "keywords": [
    "web security",
    "web application security",
    "webappsec",
    "owasp",
    "pentest",
    "pentesting",
    "security",
    "vulnerable",
    "vulnerability",
    "broken",
    "bodgeit"
  ],
  "dependencies": {
    "body-parser": "~1.18",
    "colors": "~1.1",
    "config": "~1.28",
    "cookie-parser": "~1.4",
    "cors": "~2.8",
    "dottie": "~2.0",
    "epilogue-js": "~0.7",
    "errorhandler": "~1.5",
    "express": "~4.16",
    "express-jwt": "0.1.3",
    "fs-extra": "~4.0",
    "glob": "~5.0",
    "grunt": "~1.0",
    "grunt-angular-templates": "~1.1",
    "grunt-contrib-clean": "~1.1",
    "grunt-contrib-compress": "~1.4",
    "grunt-contrib-concat": "~1.0",
    "grunt-contrib-uglify": "~3.2",
    "hashids": "~1.1",
    "helmet": "~3.9",
    "html-entities": "~1.2",
    "jasmine": "^2.8.0",
    "js-yaml": "3.10",
    "jsonwebtoken": "~8",
    "jssha": "~2.3",
    "libxmljs": "~0.18",
    "marsdb": "~0.6",
    "morgan": "~1.9",
    "multer": "~1.3",
    "pdfkit": "~0.8",
    "replace": "~0.3",
    "request": "~2",
    "sanitize-html": "1.4.2",
    "sequelize": "~4",
    "serve-favicon": "~2.4",
    "serve-index": "~1.9",
    "socket.io": "~2.0",
    "sqlite3": "~3.1.13",
    "z85": "~0.0"
  },
  "devDependencies": {
    "chai": "~4",
    "codeclimate-test-reporter": "~0.5",
    "cross-spawn": "~5.1",
    "eslint": "~4.7",
    "eslint-scope": "3.7.2",
    "form-data": "~2.3",
    "frisby": "~2.0",
    "grunt-cli": "~1.2",
    "http-server": "~0.10",
    "jasmine-reporters": "~2.2",
    "jest": "~22",
    "karma": "~1.7",
    "karma-chrome-launcher": "~2.2",
    "karma-cli": "~1.0",
    "karma-coverage": "~1.1",
    "karma-jasmine": "~1.1",
    "karma-junit-reporter": "~1.2",
    "karma-phantomjs-launcher": "~1.0",
    "karma-safari-launcher": "~1.0",
    "lcov-result-merger": "~1.2",
    "mocha": "~4",
    "nyc": "~11",
    "phantomjs-prebuilt": "~2",
    "protractor": "~5",
    "shelljs": "~0.7",
    "sinon": "~4",
    "sinon-chai": "~2.14",
    "socket.io-client": "~2.0",
    "standard": "~10",
    "stryker": "~0",
    "stryker-api": "~0",
    "stryker-html-reporter": "~0",
    "stryker-jasmine": "~0",
    "stryker-karma-runner": "~0",
    "stryker-mocha-runner": "~0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/juice-shop/juice-shop.git"
  },
  "bugs": {
    "url": "https://github.com/juice-shop/juice-shop/issues"
  },
  "license": "MIT",
  "scripts": {
    "postinstall": "npm --prefix ./app install ./app && grunt minify",
    "start": "node app",
    "test": "standard && karma start karma.conf.js && nyc --report-dir=./build/reports/coverage/server-tests mocha test/server",
    "frisby": "nyc --report-dir=./build/reports/coverage/api-tests node ./test/apiTests.js",
    "preupdate-webdriver": "npm install",
    "update-webdriver": "webdriver-manager update",
    "preprotractor": "npm run update-webdriver",
    "protractor": "node test/e2eTests.js",
    "stryker": "stryker run stryker.client-conf.js",
    "vagrant": "cd vagrant && vagrant up"
  },
  "engines": {
    "node": ">=6 <=9"
  },
  "standard": {
    "ignore": [
      "/app/private/**",
      "/vagrant/**"
    ],
    "env": {
      "jasmine": true,
      "node": true,
      "browser": true,
      "mocha": true,
      "protractor": true
    },
    "globals": [
      "angular",
      "inject"
    ]
  },
  "nyc": {
    "include": [
      "lib/*.js",
      "routes/*.js"
    ],
    "all": true,
    "reporter": [
      "lcov",
      "text-summary"
    ]
  },
  "jest": {
    "testMatch": [
      "**/test/api/*Spec.js"
    ],
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/app/node_modules/"
    ]
  }
}
