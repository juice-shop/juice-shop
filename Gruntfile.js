/*jslint node: true */
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            js: {
                files: {
                    'app/tmp/juice-shop.min.js': [ 'app/tmp/juice-shop.js' ]
                },
                options: {
                    mangle: true
                }
            },
            dist: {
                files: {
                    'app/dist/juice-shop.min.js': [ 'app/tmp/juice-shop.min.js' ]
                }
            }
        },

        ngtemplates: {
            juiceShop: {
                cwd: 'app',
                src: [ 'views/*.html' ],
                dest: 'app/tmp/views.js'
            }
        },

        clean: {
            temp: {
                src: [ 'app/tmp' ]
            },
            dist: {
                src: [ 'app/dist' ]
            },
            pckg: {
                src: [ 'dist' ]
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            js: {
                src: [ 'app/js/**/*.js' ],
                dest: 'app/tmp/juice-shop.js'
            },
            dist: {
                src: [ 'app/tmp/juice-shop.min.js', 'app/tmp/*.js' ],
                dest: 'app/tmp/juice-shop.min.js'
            }
        },

        compress: {
            windows: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>_node4_win64.zip'
                },
                files: [
                    {
                        src: [  'app/index.html',
                            'app/dist/juice-shop.min.js',
                            'app/css/*.css',
                            'app/css/geo-bootstrap/**',
                            'app/bower_components/**',
                            'app/public/**',
                            'app/private/**',
                            'server.js',
                            'app.js',
                            'models/*.js',
                            'routes/*.js',
                            'data/*.js',
                            'lib/*.js',
                            'package.json',
                            '*.md',
                            'node_modules/sequelize/**',
                            'node_modules/sqlite3/**',
                            'node_modules/express/**',
                            'node_modules/errorhandler/**',
                            'node_modules/cookie-parser/**',
                            'node_modules/serve-index/**',
                            'node_modules/serve-favicon/**',
                            'node_modules/body-parser/**',
                            'node_modules/sequelize-restful/**',
                            'node_modules/morgan/**',
                            'node_modules/sanitize-html/**',
                            'node_modules/express-jwt/**',
                            'node_modules/jsonwebtoken/**',
                            'node_modules/helmet/**',
                            'node_modules/pdfkit/**',
                            'node_modules/z85/**',
                            'node_modules/glob/**',
                            'node_modules/colors/**'
                        ]
                    }
                ]
            },
            linux: {
                options: {
                    archive: 'dist/<%= pkg.name %>-<%= pkg.version %>_node4_linux.tar'
                },
                files: [
                    {
                        src: [  'app/index.html',
                            'app/dist/juice-shop.min.js',
                            'app/css/*.css',
                            'app/css/geo-bootstrap/**',
                            'app/bower_components/**',
                            'app/public/**',
                            'app/private/**',
                            'server.js',
                            'app.js',
                            'models/*.js',
                            'routes/*.js',
                            'data/*.js',
                            'lib/*.js',
                            'package.json',
                            '*.md',
                            'node_modules/sequelize/**',
                            'node_modules/sqlite3/**',
                            'node_modules/express/**',
                            'node_modules/errorhandler/**',
                            'node_modules/cookie-parser/**',
                            'node_modules/serve-index/**',
                            'node_modules/serve-favicon/**',
                            'node_modules/body-parser/**',
                            'node_modules/sequelize-restful/**',
                            'node_modules/morgan/**',
                            'node_modules/sanitize-html/**',
                            'node_modules/express-jwt/**',
                            'node_modules/jsonwebtoken/**',
                            'node_modules/helmet/**',
                            'node_modules/pdfkit/**',
                            'node_modules/z85/**',
                            'node_modules/glob/**',
                            'node_modules/colors/**'
                        ]
                    }
                ]
            }
        },

        retire: {
            js: ['app/**/*.js'],
            node: ['.'],
            options: {
            }
        },

        exec: {
            api_tests: {
                command: 'jasmine-node test/server',
                exitCodes: [0,1]
            },
            e2e_tests: {
                command: 'protractor protractor.conf.js',
                exitCodes: [0,1]
            }
        },

        'zap_start': {
            options: {
                os: 'windows',
                path: 'C:\\Program Files (x86)\\OWASP\\Zed Attack Proxy',
                port: 8090
            }
        },
        'zap_spider': {
            options: {
                exclude: ['.*bower_components.*'],
                port: 8090
            },
            localhost: {
                options: {
                    url: 'http://localhost:3000'
                }
            },
            heroku: {
                options: {
                    url: 'https://juice-shop.herokuapp.com'
                }
            }
        },
        'zap_scan': {
            options: {
                port: 8090
            },
            localhost: {
                options: {
                    url: 'http://localhost:3000'
                }
            },
            heroku: {
                options: {
                    url: 'https://juice-shop.herokuapp.com'
                }
            }
        },
        'zap_alert': {
            options: {
                port: 8090
            }
        },
        'zap_report': {
            options: {
                dir: 'build/reports/zaproxy',
                html: false,
                port: 8090
            }
        },
        'zap_stop': {
            options: {
                port: 8090
            }
        }
    });

    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-retire');
    grunt.loadNpmTasks('grunt-zaproxy');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('minify', [ 'clean:dist', 'concat:js', 'uglify:js', 'ngtemplates:juiceShop', 'concat:dist', 'uglify:dist', 'clean:temp' ]);
    grunt.registerTask('package-windows', [ 'clean:pckg', 'minify', 'compress:windows' ]);
    grunt.registerTask('package-linux', [ 'clean:pckg', 'minify', 'compress:linux' ]);
    grunt.registerTask('zap', [ 'zap_start', 'exec:e2e_tests', 'exec:api_tests', 'zap_spider:localhost', 'zap_scan:localhost', 'zap_alert', 'zap_report', 'zap_stop', 'zap_results' ]);
};