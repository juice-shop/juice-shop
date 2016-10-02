module.exports = function (config) {
  'use strict'

  config.set({
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
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/ng-file-upload/ng-file-upload.js',
      'app/bower_components/angular-socket.io-mock/angular-socket.io-mock.js',
      'app/bower_components/clipboard/dist/clipboard.js',
      'app/bower_components/ngclipboard/dist/ngclipboard.js',
      'app/js/**/*.js',
      'test/client/**/*.js'
    ],
    mutate: ['app/js/**/*.js'],
    testRunner: 'karma',
    testFramework: 'jasmine',
    reporter: ['html', 'progress'],
    htmlReporter: {
      baseDir: 'build/reports/mutation'
    }
  })
  if (process.env.TRAVIS_BUILD_NUMBER) {
    config.reporter = ['clear-text', 'progress']
  }
}

