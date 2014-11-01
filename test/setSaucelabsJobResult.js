/*jslint node: true */
'use strict';

var SauceLabs = require('saucelabs');

module.export = function(exitCode) {
    if (process.env.SAUCE_USERNAME && process.env.TRAVIS_BUILD_NUMBER) {
        var sauceLabs = new SauceLabs({ username: process.env.SAUCE_USERNAME, password: process.env.SAUCE_ACCESS_KEY });
        sauceLabs.getJobs(function (err, jobs) {
            console.log(jobs);
            for (var j in jobs) {
                if (jobs.hasOwnProperty(j)) {
                    sauceLabs.showJob(jobs[j].id, function (err, job) {
                        console.log(job);
                        var tags = job.tags;
                        console.log(tags);
                        for (var i = 0; i < tags.length; i++) {
                            if (tags[i] === process.env.TRAVIS_BUILD_NUMBER) {
                                sauceLabs.updateJob(job.id, 'passed=' + exitCode === 0 ? 'true' : 'false', function (err, res) {
                                    console.log('Marked job ' + job.id + ' for build #' + process.env.TRAVIS_BUILD_NUMBER + ' as ' + exitCode === 0 ? 'PASSED.' : 'FAILED.')
                                });
                            }
                        }
                    });
                }
            }
        });
    }
}