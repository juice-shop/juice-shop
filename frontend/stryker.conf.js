module.exports = function (config) {
  'use strict'

  config.set({
    mutate: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/test.ts',
      '!src/environments/*.ts'
    ],
    mutator: 'typescript',
    testRunner: 'karma',
    karma: {
      configFile: 'src/karma.conf.js',
      projectType: 'angular-cli',
      config: {
        browsers: ['ChromeHeadless']
      }
    },
    reporters: ['progress', 'clear-text', 'html'],
    htmlReporter: {
      baseDir: '../build/reports/mutation/frontend'
    },
    maxConcurrentTestRunners: 2,
    coverageAnalysis: 'off'
  })
  if (process.env.TRAVIS_BUILD_NUMBER) {
    config.reporter = ['clear-text', 'progress']
  }
}
