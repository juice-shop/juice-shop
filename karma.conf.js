module.exports = function (config) {
    config.set({

        basePath: '',

        files: [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap.js',
            'app/bower_components/underscore/underscore.js',
            'app/bower_components/jquery/jquery.js',
            'app/bower_components/angular-grid/build/ng-grid.js',
            'app/js/app.js',
            'app/js/**/*.js',
            'test/client/**/*.js'
        ],

        colors: true,
        singleRun: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        plugins: [
            'karma-chrome-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-coverage'
        ],

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },

        preprocessors: {
            'app/js/**/*.js': 'coverage'
        }
    });
};
