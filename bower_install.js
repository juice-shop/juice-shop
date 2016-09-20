'use strict'

var bower = require('bower')

bower.commands.install()
    .on('log', function (data) {
      console.log(data)
    })
