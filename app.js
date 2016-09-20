'use strict'

var server = require('./server')
server.start({ port: process.env.PORT || 3000 })
