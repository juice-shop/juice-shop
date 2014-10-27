/*jslint node: true */
'use strict';

var fs = require('fs'),
    path = require('path'),
    PDFDocument = require('pdfkit'),
    utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    models = require('../models/index'),
    cache = require('../lib/datacache'),
    challenges = cache.challenges;

exports.verifyForgedFeedbackChallenge = function() {
    return function(req, res, next) {
        if (utils.notSolved(challenges.forgedFeedbackChallenge)) {
            var user = insecurity.authenticatedUsers.from(req);
            var userId = user ? user.data.id : undefined;
            if (req.body.UserId && req.body.UserId != userId) {
                utils.solve(challenges.forgedFeedbackChallenge);
            }
        }
        next();
    };
};

exports.verifyAccessControlChallenges = function() {
    return function (req, res, next) {
        if (utils.notSolved(challenges.scoreBoardChallenge) && utils.endsWith(req.url, '/scoreboard.png')) {
            utils.solve(challenges.scoreBoardChallenge);
        } else if (utils.notSolved(challenges.adminSectionChallenge) && utils.endsWith(req.url, '/administration.png')) {
            utils.solve(challenges.adminSectionChallenge);
        }
        next();
    };
};

exports.retrieveAppVersion = function() {
    return function (req, res) {
        res.json({version: utils.version()});
    };
};

exports.serveAngularClient = function() {
    return function (req, res, next) {
        if (!utils.startsWith(req.url, '/api') && !utils.startsWith(req.url, '/rest')) {
            res.sendFile(path.resolve(__dirname + '/../app/index.html'));
        } else {
            next(new Error('Unexpected path: ' + req.url));
        }
    };
};

exports.verifyErrorHandlingChallenge = function() {
    return function (err, req, res, next) {
        if (utils.notSolved(challenges.errorHandlingChallenge) && err && res.statusCode > 401) {
            utils.solve(challenges.errorHandlingChallenge);
        }
        next(err);
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
    return function(req, res) {
        var to = req.query.to;
        var githubUrl = 'https://github.com/bkimminich/juice-shop';
        if (to.indexOf(githubUrl) > -1) {
            if (utils.notSolved(challenges.redirectChallenge) && to !== githubUrl) { // TODO Instead match against something like <anotherUrl>[?&]=githubUrl
                utils.solve(challenges.redirectChallenge);
            }
            res.redirect(to);
        } else {
            res.redirect(githubUrl);
        }
    };
};

exports.serveFiles = function() {
    return function(req, res, next) {
        var file = req.params.file;
        if (file && (utils.endsWith(file, '.md') || (utils.endsWith(file, '.pdf')))) {
            file = insecurity.cutOffPoisonNullByte(file);
            if (utils.notSolved(challenges.easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
                utils.solve(challenges.easterEggLevelOneChallenge);
            } else if (utils.notSolved(challenges.directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
                utils.solve(challenges.directoryListingChallenge);
            }
            res.sendFile(path.resolve(__dirname + '/../app/public/ftp/' + file));
        } else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    };
};

exports.verifyDatabaseRelatedChallenges = function() {
    return function (req, res, next) {
        if (utils.notSolved(challenges.changeProductChallenge) && cache.products.osaft) {
            cache.products.osaft.reload().success(function () {
                if (!utils.contains(cache.products.osaft.description, '<a href="https://www.owasp.org/index.php/O-Saft" target="_blank">')) {
                    if (utils.contains(cache.products.osaft.description, '<a href="http://kimminich.de" target="_blank">')) {
                        utils.solve(challenges.changeProductChallenge);
                    }
                }
            });
        }
        if (utils.notSolved(challenges.csrfChallenge) && cache.users.bender) {
            cache.users.bender.reload().success(function() {
                if (cache.users.bender.password === insecurity.hash('slurmCl4ssic')) {
                    utils.solve(challenges.csrfChallenge);
                }
            });
        }
        if (utils.notSolved(challenges.feedbackChallenge)) {
            models.Feedback.findAndCountAll({where: {rating: 5}}).success(function (feedbacks) {
                if (feedbacks.count === 0) {
                    utils.solve(challenges.feedbackChallenge);
                }
            });
        }
        if (utils.notSolved(challenges.knownVulnerableComponentChallenge)) {
            models.Feedback.findAndCountAll({where: models.Sequelize.or(
                    models.Sequelize.and(['comment LIKE \'%sanitize-html%\''], ['comment LIKE \'%1.4.2%\'']),
                    models.Sequelize.and(['comment LIKE \'%htmlparser2%\''], ['comment LIKE \'%3.3.0%\'']) ) }
            ).success(function (data) {
                    if (data.count > 0) {
                        utils.solve(challenges.knownVulnerableComponentChallenge);
                    }
                });
        }
        next();
    };
};