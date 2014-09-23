/*jslint node: true */
'use strict';

var spawn = require('win-spawn');
var server = require('./../server.js');
server.start({ port: 3000 }, function () {
    var jasmineNode = spawn('jasmine-node', [ 'test/server' ]);

    function logToConsole(data) {
        console.log(String(data));
    }

    jasmineNode.stdout.on('data', logToConsole);
    jasmineNode.stderr.on('data', logToConsole);

    jasmineNode.on('exit', function (exitCode) {
        console.log('Jasmine-Node exited with code ' + exitCode + '.');
        server.close();
    });
});