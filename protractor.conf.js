/*jslint node: true */
/*global jasmine*/
'use strict';

exports.config = {
    directConnect: true,

    allScriptsTimeout: 120000,

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
        defaultTimeoutInterval: 120000
    },

    onPrepare: function() {
        require('jasmine-reporters');
        jasmine.getEnv().addReporter(
            new jasmine.JUnitXmlReporter('test/reports/e2e_results', true, true));
    },

    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY

};

if (process.env.TRAVIS_BUILD_NUMBER) {
    exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
    exports.config.capabilities = {
        'name': 'Juice-Shop e2e Tests (Protractor)',
        'browserName': 'chrome',
        'platform': 'Windows 7',
        'screen-resolution': '1920x1200',
        'username': process.env.SAUCE_USERNAME,
        'accessKey': process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'tags': [process.env.TRAVIS_BRANCH, process.env.TRAVIS_BUILD_NUMBER, 'e2e']
    };
    
};
