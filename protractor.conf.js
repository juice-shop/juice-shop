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

if (process.env.TRAVIS_BUILD_NUMBER) {
    config.seleniumAddress = 'http://localhost:4445/wd/hub';
    config.capabilities = {
        'username': process.env.SAUCE_USERNAME,
        'accessKey': process.env.SAUCE_ACCESS_KEY,
        'browserName': 'chrome',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'name': 'Juice Shop e2e Protractor Tests'
    }
}
