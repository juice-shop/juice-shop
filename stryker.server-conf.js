module.exports = function (config) {
  'use strict'

  config.set({
    files: [
      { pattern: 'data/*.js', mutated: true, included: false },
      { pattern: 'lib/*.js', mutated: true, included: false },
      { pattern: 'models/*.js', mutated: true, included: false },
      { pattern: 'routes/*.js', mutated: true, included: false },
      { pattern: 'encryptionkeys/**', included: false, mutated: false },
      { pattern: 'config/default.yml', included: false, mutated: false },
      { pattern: 'app/index.html', included: false, mutated: false },
      { pattern: 'package.json', included: false, mutated: false },
      { pattern: 'ctf.key', included: false, mutated: false },
      'test/server/*Spec.js'
    ],
    testRunner: 'mocha',
    testFramework: 'mocha',
    coverageAnalysis: 'perTest',
    mutator: 'javascript',
    reporter: ['html', 'progress'],
    htmlReporter: {
      baseDir: 'build/reports/mutation/server'
    }
  })
  if (process.env.TRAVIS_BUILD_NUMBER) {
    config.reporter = ['clear-text', 'progress']
  }
}
