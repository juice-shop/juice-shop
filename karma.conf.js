module.exports = function (config) {
  'use strict'

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
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/underscore/underscore.js',
      'app/bower_components/jquery/dist/jquery.js',
      'app/bower_components/ng-file-upload/ng-file-upload.js',
      'app/bower_components/angular-socket-io/socket.js',
      'app/js/**/*.js',
      'test/client/**/*.js'
    ],

    colors: true,
    singleRun: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-coverage',
      'karma-junit-reporter'
    ],

    reporters: ['progress', 'coverage', 'junit'],

    coverageReporter: {
      type: 'lcov',
      dir: 'build/reports/coverage'
    },

    preprocessors: {
      'app/js/**/*.js': 'coverage'
    },

    junitReporter: {
      outputDir: 'build/reports'
    }
  })
}
