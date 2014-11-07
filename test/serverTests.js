/*jslint node: true */
'use strict';

var spawn = require('win-spawn'),
    colors = require('colors/safe'),
    server = require('./../server.js');

server.start({ port: 3000 }, function () {
    var jasmineNode = spawn('jasmine-node', [ 'test/server', '--junitreport', '--output', 'test/reports/server_results' ]);

    function logToConsole(data) {
        console.log(String(data));
    }

    jasmineNode.stdout.on('data', logToConsole);
    jasmineNode.stderr.on('data', logToConsole);

    jasmineNode.on('exit', function (exitCode) {
        console.log('Jasmine-Node exited with code ' + exitCode + '(' + (exitCode === 0 ? colors.green('SUCCESS') : colors.red('FAILED')) + ')');
        process.exit(exitCode);
    });
});