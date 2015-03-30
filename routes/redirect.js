/*jslint node: true */
'use strict';

var utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    challenges = require('../data/datacache').challenges;

exports = module.exports = function performRedirect() {
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