module.exports = function (config) {
  'use strict'

  config.set({

    basePath: '',

    files: [
      'app/node_modules/angular/angular.js',
      'app/node_modules/angular-translate/dist/angular-translate.js',
      'app/node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
      'app/node_modules/angular-route/angular-route.js',
      'app/node_modules/angular-mocks/angular-mocks.js',
      'app/node_modules/angular-cookies/angular-cookies.js',
      'app/node_modules/angular-touch/angular-touch.js',
      'app/node_modules/angular-animate/angular-animate.js',
      'app/node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
      'app/node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
      'app/node_modules/underscore/underscore.js',
      'app/node_modules/jquery/dist/jquery.js',
      'app/node_modules/ng-file-upload/dist/ng-file-upload.js',
      'app/node_modules/angular-socket.io-mock/angular-socket.io-mock.js',
      'app/node_modules/clipboard/dist/clipboard.js',
      'app/node_modules/ngclipboard/dist/ngclipboard.js',
      'app/node_modules/angular-base64/angular-base64.js',
      'app/node_modules/qrcode-generator/qrcode.js',
      'app/node_modules/angular-qrcode/angular-qrcode.js',
      'app/node_modules/cookieconsent/build/cookieconsent.min.js',
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
