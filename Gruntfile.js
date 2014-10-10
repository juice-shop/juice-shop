/*jslint node: true */
'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            dist: {
                files: {
                    'app/dist/juice-shop.min.js': [ 'app/dist/juice-shop.js' ]
                },
                options: {
                    mangle: true
                }
            }
        },

        html2js: {
            dist: {
                src: [ 'app/views/*.html' ],
                dest: 'app/tmp/views.js'
            }
        },

        clean: {
            temp: {
                src: [ 'app/tmp' ]
            },
            dist: {
                src: [ 'app/dist' ]
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [ 'app/js/**/*.js', 'app/tmp/*.js' ],
                dest: 'app/dist/juice-shop.js'
            }
        },

    });

    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('package', [ 'clean:dist', 'html2js:dist', 'concat:dist', 'uglify:dist', 'clean:temp', ]);
};