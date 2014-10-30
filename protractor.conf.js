/*jslint node: true */
exports.config = {
    directConnect: true,

    allScriptsTimeout: 60000,

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
        defaultTimeoutInterval: 60000
    },

    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY

};

if (process.env.TRAVIS_BUILD_NUMBER) {
    exports.config.seleniumAddress = 'http://localhost:4445/wd/hub';
    exports.config.capabilities = {
        'name': 'Juice-Shop e2e Tests (Protractor)',
        'browserName': 'firefox',
        'username': process.env.SAUCE_USERNAME,
        'accessKey': process.env.SAUCE_ACCESS_KEY,
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'tags': [process.env.TRAVIS_BRANCH, process.env.TRAVIS_BUILD_NUMBER]
    }
    
}
