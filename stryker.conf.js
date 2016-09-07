/*jslint node: true */
module.exports = function(config){
    'use strict';

    config.set({
        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-cookies/angular-cookies.js',
            'app/bower_components/angular-touch/angular-touch.js',
            'app/bower_components/angular-animate/angular-animate.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/jquery/dist/jquery.js',
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
    });
};