'use strict'

exports.config = {
  directConnect: true,

  allScriptsTimeout: 80000,

  specs: [
    'test/e2e/*.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:3000',

  framework: 'jasmine',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 80000
  },

  onPrepare: function () {
    require('jasmine-reporters')
    jasmine.getEnv().addReporter(
            new jasmine.JUnitXmlReporter('build/reports/e2e_results', true, true))
  }
}

if (process.env.TRAVIS_BUILD_NUMBER) {
  exports.config.capabilities = {
    'browserName': 'firefox'
  }
}
