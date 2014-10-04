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
                    mangle: false
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [ 'app/js/**/*.js' ],
                dest: 'app/dist/juice-shop.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('minify', [ 'concat:dist', 'uglify:dist' ]);
};