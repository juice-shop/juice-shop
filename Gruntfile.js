'use strict'

module.exports = function (grunt) {
  var node = grunt.option('node') || process.env.nodejs_version || process.env.TRAVIS_NODE_VERSION || ''
  var platform = grunt.option('platform') || process.env.PLATFORM || process.env.TRAVIS ? 'x64' : ''
  var os = grunt.option('os') || process.env.APPVEYOR ? 'windows' : process.env.TRAVIS ? 'linux' : ''

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compress: {
      pckg: {
        options: {
          mode: os === 'linux' ? 'tgz' : 'zip',
          archive: 'dist/<%= pkg.name %>-<%= pkg.version %>' + (node ? ('_node' + node) : '') + (os ? ('_' + os) : '') + (platform ? ('_' + platform) : '') + (os === 'linux' ? '.tgz' : '.zip')
        },
        files: [
          {
            src: [
              '*.md',
              'app.js',
              'server.js',
              'package.json',
              'ctf.key',
              'swagger.yml',
              'frontend/dist/frontend/**',
              'config/*.yml',
              'data/*.js',
              'data/static/*.yml',
              'encryptionkeys/**',
              'ftp/**',
              'lib/**',
              'models/*.js',
              'routes/*.js',
              'node_modules/**'
            ],
            dest: 'juice-shop_<%= pkg.version %>/'
          }
        ]
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-compress')
  grunt.registerTask('package', [ 'compress:pckg' ])
}
