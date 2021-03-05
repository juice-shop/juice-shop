/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const url = require('url')

let proxy = {
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
    'test/e2e/*.ts'
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
  beforeLaunch: function () {
    require('ts-node').register({
      project: 'tsconfig.json'
    })
  },
  onPrepare: function () {
    const jasmineReporters = require('jasmine-reporters')
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: 'build/reports/e2e_results'
    }))

    let basePath = (new url.URL(browser.baseUrl)).pathname
    if (basePath === '/') basePath = ''

    // Get all banners out of the way
    browser.get(basePath + '/#')
    browser.manage().addCookie({ name: 'cookieconsent_status', value: 'dismiss' })
    browser.manage().addCookie({ name: 'welcomebanner_status', value: 'dismiss' })

    // Ensure score board shows all challenges (by default only 1-star challenges are shown)
    browser.get(basePath + '/#/score-board')
    element(by.id('btnToggleAllDifficulties')).click()
  }
}

if (process.env.CI) {
  exports.config.capabilities.chromeOptions = {
    args: ['--headless', '--disable-gpu', '--window-size=1024,768']
  }
}
