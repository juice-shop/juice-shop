/*jslint node: true */
module.exports = function (config) {
    'use strict';

    var customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox'
        },
        sl_opera: {
            base: 'SauceLabs',
            browserName: 'opera'
        },
        sl_safari: {
            base: 'SauceLabs',
            browserName: 'safari'
        },
        sl_ie_11: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '11'
        },
        sl_ie_10: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '10'
        },
        sl_ie_9: {
            base: 'SauceLabs',
            browserName: 'internet explorer',
            version: '9'
        },
        sl_android: {
            base: 'SauceLabs',
            browserName: 'android'
        },
        sl_iphone: {
            base: 'SauceLabs',
            browserName: 'iphone'
        },
        sl_ipad: {
            base: 'SauceLabs',
            browserName: 'ipad'
        }
    };

    config.set({

        basePath: '',

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/jquery/dist/jquery.js',
            'app/js/app.js',
            'app/js/**/*.js',
            'test/client/**/*.js'
        ],

        sauceLabs: {
            testName: 'Juice-Shop Angular Unit Tests',
            recordVideo: true,
            tags: [process.env.TRAVIS_BRANCH, process.env.TRAVIS_PULL_REQUEST]
        },

        colors: true,
        singleRun: true,

        frameworks: ['jasmine'],

        browsers: Object.keys(customLaunchers),

        customLaunchers: customLaunchers,

        reporters: ['dots', 'saucelabs']

    });
};
