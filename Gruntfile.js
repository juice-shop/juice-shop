'use strict'

module.exports = function (grunt) {
  var node = grunt.option('node') || process.env.nodejs_version || process.env.TRAVIS_NODE_VERSION || ''
  var platform = grunt.option('platform') || process.env.TRAVIS ? 'x64' : ''
  var os = grunt.option('os') || process.env.TRAVIS_OS_NAME === 'windows' ? 'win32' : (process.env.TRAVIS_OS_NAME === 'osx' ? 'darwin' : (process.env.TRAVIS_OS_NAME || ''))

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    replace_json: {
      manifest: {
        src: 'package.json',
        changes: {
          'engines.node': (node || '<%= pkg.engines.node %>'),
          os: (os ? [os] : '<%= pkg.os %>'),
          cpu: (platform ? [platform] : '<%= pkg.cpu %>')
        }
      }
    },

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
              'data/static/**',
              'encryptionkeys/**',
              'ftp/**',
              'lib/**',
              'models/*.js',
              'routes/*.js',
              'node_modules/**',
              'views/**',
              'uploads/complaints/.gitkeep'
            ],
            dest: 'juice-shop_<%= pkg.version %>/'
          }
        ]
      }
    }
  })

  grunt.loadNpmTasks('grunt-replace-json')
  grunt.loadNpmTasks('grunt-contrib-compress')
  grunt.registerTask('package', ['replace_json:manifest', 'compress:pckg'])
}
