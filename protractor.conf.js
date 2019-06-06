'use strict'

var proxy = {
  proxyType: 'autodetect'
}

if (process.env.HTTP_PROXY !== undefined && process.env.HTTP_PROXY !== null) {
  proxy = {
    proxyType: 'manual',
    httpProxy: process.env.HTTP_PROXY
  }
}

exports.config = {
  directConnect: true,

  allScriptsTimeout: 80000,

  specs: [
    'test/e2e/*.js'
  ],

  capabilities: {
    browserName: 'chrome',
    proxy: proxy,
    chromeOptions: {
      args: ['--window-size=1024,768']
    }
  },

  baseUrl: 'http://localhost:3000',

  framework: 'jasmine2',

  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 90000
  },

  onPrepare: function () {
    var jasmineReporters = require('jasmine-reporters')
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: 'build/reports/e2e_results'
    }))

    // Get cookie consent popup out of the way
    browser.get('/#')
    browser.manage().addCookie({ name: 'cookieconsent_status', value: 'dismiss' })

    // Get welcome banner out of the way
    let welcomeClose = element.all(by.className('welcome-banner-close-button'))
    if (welcomeClose.isPresent()) { welcomeClose.first().click() }

    browser.manage().addCookie({ name: 'welcome-banner-status', value: 'dismiss' })
  }
}

if (process.env.TRAVIS_BUILD_NUMBER) {
  exports.config.capabilities.chromeOptions = {
    args: ['--headless', '--disable-gpu', '--window-size=1024,768']
  }
}
