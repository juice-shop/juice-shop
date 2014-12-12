/*jslint node: true */
'use strict';

var path = require('path'),
    utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    cache = require('../data/datacache'),
    challenges = cache.challenges;

exports.serveAngularClient = function() {
    return function (req, res, next) {
        if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
            res.sendFile(path.resolve(__dirname + '/../app/index.html'));
        } else {
            next(new Error('Unexpected path: ' + req.url));
        }
    };
};

exports.retrieveAppVersion = function() {
    return function (req, res) {
        res.json({version: utils.version()});
    };
};

exports.servePublicFiles = function() {
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
            res.sendFile(path.resolve(__dirname + '/../app/public/ftp/' + file));
        } else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    };
};

exports.serveEasterEgg = function() {
    return function (req, res) {
        if (utils.notSolved(challenges.easterEggLevelTwoChallenge)) {
            utils.solve(challenges.easterEggLevelTwoChallenge);
        }
        res.sendFile(path.resolve(__dirname + '/../app/private/threejs-demo.html'));
    };
};

exports.performRedirect = function() {
    return function(req, res, next) {
        var toUrl = req.query.to;
        if (insecurity.isRedirectAllowed(toUrl)) {
            if (utils.notSolved(challenges.redirectChallenge) && insecurity.redirectWhitelist.indexOf(toUrl) === -1) {
                utils.solve(challenges.redirectChallenge);
            }
            res.redirect(toUrl);
        } else {
            res.status(406);
            next(new Error('Unrecognized target URL for redirect: ' + toUrl));
        }
    };
};