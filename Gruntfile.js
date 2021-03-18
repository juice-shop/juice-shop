/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

'use strict'

module.exports = function (grunt) {
  const os = grunt.option('os') || process.env.PCKG_OS_NAME || ''
  const platform = grunt.option('platform') || process.env.PCKG_CPU_ARCH || ''
  const node = grunt.option('node') || process.env.nodejs_version || process.env.PCKG_NODE_VERSION || ''

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
              'LICENSE',
              '*.md',
              'package.json',
              'ctf.key',
              'swagger.yml',
              'config.schema.yml',
              'build/**',
              '!build/reports/**',
              'config/*.yml',
              'data/*.js',
              'data/static/**',
              'data/chatbot/.gitkeep',
              'encryptionkeys/**',
              'frontend/dist/frontend/**',
              'ftp/**',
              'i18n/.gitkeep',
              'lib/**',
              'models/*.js',
              'node_modules/**',
              'routes/*.js',
              'uploads/complaints/.gitkeep',
              'views/**'
            ],
            dest: 'juice-shop_<%= pkg.version %>/'
          }
        ]
      }
    }
  })

  grunt.registerTask('checksum', 'Create .md5 checksum files', function () {
    const fs = require('fs')
    const crypto = require('crypto')
    fs.readdirSync('dist/').forEach(file => {
      const buffer = fs.readFileSync('dist/' + file)
      const md5 = crypto.createHash('md5')
      md5.update(buffer)
      const md5Hash = md5.digest('hex')
      const md5FileName = 'dist/' + file + '.md5'
      grunt.file.write(md5FileName, md5Hash)
      grunt.log.write(`Checksum ${md5Hash} written to file ${md5FileName}.`).verbose.write('...').ok()
      grunt.log.writeln()
    })
  })

  grunt.loadNpmTasks('grunt-replace-json')
  grunt.loadNpmTasks('grunt-contrib-compress')
  grunt.registerTask('package', ['replace_json:manifest', 'compress:pckg', 'checksum'])
}
