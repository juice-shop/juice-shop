/*jslint node: true */
'use strict';

var path = require('path'),
    utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    challenges = require('../data/datacache').challenges;

exports = module.exports = function servePublicFiles() {
    return function(req, res, next) {
        var file = req.params.file;
        if (file && (utils.endsWith(file, '.md') || (utils.endsWith(file, '.pdf')))) {
            file = insecurity.cutOffPoisonNullByte(file);
            if (utils.notSolved(challenges.easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
                utils.solve(challenges.easterEggLevelOneChallenge);
            } else if (utils.notSolved(challenges.directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
                utils.solve(challenges.directoryListingChallenge);
            } else if (utils.notSolved(challenges.forgottenBackupChallenge) && (file.toLowerCase() === 'coupons_2013.md.bak' || file.toLowerCase() === 'package.json.bak')) {
                utils.solve(challenges.forgottenBackupChallenge);
            }
            res.sendFile(path.resolve(__dirname + '/../ftp/' + file));
        } else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    };
};