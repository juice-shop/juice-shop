/*jslint node: true */
'use strict';

var spawn = require('win-spawn'),
    colors = require('colors/safe'),
    server = require('./../server.js');

server.start({ port: 3000 }, function () {
    var protractor = spawn('protractor', [ 'protractor.conf.js' ]);

    function logToConsole(data) {
        console.log(String(data));
    }

    protractor.stdout.on('data', logToConsole);
    protractor.stderr.on('data', logToConsole);

    protractor.on('exit', function (exitCode) {
        console.log('Protractor exited with code ' + exitCode + ' (' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')');
        process.exit(exitCode);
    });
});