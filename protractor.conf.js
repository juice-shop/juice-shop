/*jslint node: true */
exports.config = {
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,

    allScriptsTimeout: 11000,

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
        defaultTimeoutInterval: 30000
    }
};
