'use strict'

module.exports = function (grunt) {
  var node = grunt.option('node') || process.env.nodejs_version || process.env.TRAVIS_NODE_VERSION || ''
  var platform = grunt.option('platform') || process.env.PLATFORM || process.env.TRAVIS ? 'x64' : ''
  var os = grunt.option('os') || process.env.APPVEYOR ? 'windows' : process.env.TRAVIS ? 'linux' : ''

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    "file-creator": {
      "manifest": {
        "manifest.json": function(fs, fd, done) {
          fs.writeSync(fd, `{ "node": "${node}", "platform": "${platform}", "os": "${os}" }`)
          done()
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
              'manifest.json',
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

  grunt.loadNpmTasks('grunt-file-creator')
  grunt.loadNpmTasks('grunt-contrib-compress')
  grunt.registerTask('package', [ 'file-creator:manifest', 'compress:pckg' ])
}
