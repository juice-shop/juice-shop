/* jslint node: true */
module.exports = function (config) {
  'use strict'

  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Linux',
      version: '46'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Linux',
      version: '42'
    },
    sl_edge_20: {
      base: 'SauceLabs',
      browserName: 'MicrosoftEdge',
      platform: 'Windows 10',
      version: '20'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    sl_ie_9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '10'
    },
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      platform: 'OS X 10.11',
      version: '9'
    }
  }

  config.set({

    basePath: '',

    files: [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-touch/angular-touch.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/ng-file-upload/ng-file-upload.js',
      'app/js/app.js',
      'app/js/**/*.js',
      'test/client/**/*.js'
    ],

    sauceLabs: {
      testName: 'OWASP Juice Shop Unit Tests',
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY,
      connectOptions: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        port: 4446
      },
      build: process.env.TRAVIS_BUILD_NUMBER,
      tags: [process.env.TRAVIS_BRANCH, process.env.TRAVIS_BUILD_NUMBER, 'unit'],
      recordScreenshots: false
    },

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 4 * 60 * 1000,
    captureTimeout: 4 * 60 * 1000,

    colors: true,
    singleRun: true,

    frameworks: ['jasmine'],

    browsers: Object.keys(customLaunchers),

    customLaunchers: customLaunchers,

    reporters: ['dots', 'saucelabs']

  })
}
