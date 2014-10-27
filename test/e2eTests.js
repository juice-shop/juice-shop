/*jslint node: true */
'use strict';

var spawn = require('win-spawn');
var server = require('./../server.js');

server.start({ port: 3000 }, function () {
    var protractor = spawn('protractor', [ 'protractor.conf.js' ]);

    function logToConsole(data) {
        console.log(String(data));
    }

    protractor.stdout.on('data', logToConsole);
    protractor.stderr.on('data', logToConsole);

    protractor.on('exit', function (exitCode) {
        console.log('Protractor exited with code ' + exitCode + '.');
        process.exit(exitCode);
    });
});