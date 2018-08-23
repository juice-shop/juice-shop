module.exports = function (config) {
  'use strict'

  config.set({
    karma: {
      configFile: 'karma.conf.js'
    },
    mutate: ['app/js/**/*.js'],
    testRunner: 'karma',
    testFramework: 'jasmine',
    coverageAnalysis: 'perTest',
    mutator: 'javascript',
    reporters: ['html', 'progress'],
    htmlReporter: {
      baseDir: 'build/reports/mutation/client'
    }
  })
  if (process.env.TRAVIS_BUILD_NUMBER) {
    config.reporter = ['clear-text', 'progress']
  }
}
