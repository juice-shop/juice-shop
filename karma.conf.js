/*jslint node: true */
module.exports = function (config) {
    'use strict';

    config.set({

        basePath: '',

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-touch/angular-touch.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/jquery/dist/jquery.js',
            'app/js/app.js',
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
            dir: 'test/coverage/'
        },

        preprocessors: {
            'app/js/**/*.js': 'coverage'
        },

        junitReporter: {
            outputDir: 'test/reports/client_results'
        }
    });
};
