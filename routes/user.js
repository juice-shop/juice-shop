/*jslint node: true */
'use strict';

var utils = require('../lib/utils'),
    insecurity = require('../lib/insecurity'),
    models = require('../models/index'),
    cache = require('../data/datacache'),
    challenges = cache.challenges;

exports.login = function() {
    return function(req, res, next){
        if (utils.notSolved(challenges.weakPasswordChallenge) && req.body.email === 'admin@juice-sh.op' && req.body.password === 'admin123') {
            utils.solve(challenges.weakPasswordChallenge);
        }
        models.sequelize.query('SELECT * FROM Users WHERE email = \'' + (req.body.email || '') + '\' AND password = \'' + insecurity.hash(req.body.password || '') + '\'', models.User, {plain: true})
            .success(function(authenticatedUser) {
                var user = utils.queryResultToJson(authenticatedUser);
                if (user.data && user.data.id) {
                    if (utils.notSolved(challenges.loginAdminChallenge) && user.data.id === 1) {
                        utils.solve(challenges.loginAdminChallenge);
                    } else if (utils.notSolved(challenges.loginJimChallenge) && user.data.id === 2) {
                        utils.solve(challenges.loginJimChallenge);
                    } else if  (utils.notSolved(challenges.loginBenderChallenge) && user.data.id === 3) {
                        utils.solve(challenges.loginBenderChallenge);
                    }
                    models.Basket.findOrCreate({UserId: user.data.id}).success(function(basket) {
                        var token = insecurity.authorize(user);
                        user.bid = basket.id; // keep track of original basket for challenge solution check
                        insecurity.authenticatedUsers.put(token, user);
                        res.json({ token: token, bid: basket.id });
                    }).error(function (error) {
                        next(error);
                    });
                } else {
                    res.status(401).send('Invalid email or password.');
                }
            }).error(function (error) {
                next(error);
            });
    };
};

exports.changePassword = function() {
    return function(req, res, next){
        var password = req.query.new;
        var repeatPassword = req.query.repeat;
        if (!password || password === 'undefined') {
            res.status(401).send('Password cannot be empty.');
        } else if (password !== repeatPassword) {
            res.status(401).send('New and repeated password do not match.');
        } else {
            var loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token);
            if (loggedInUser) {
                models.User.find(loggedInUser.data.id).success(function(user) {
                    user.updateAttributes({password: password}).success(function(user) {
                        res.send(user);
                    }).error(function(error) {
                        next(error);
                    });
                }).error(function(error) {
                    next(error);
                });
            } else {
                next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
            }
        }
    };
};

exports.retrieveLoggedInUsersId = function() {
    return function (req, res) {
        var user = insecurity.authenticatedUsers.from(req);
        res.json({id: (user ? user.data.id : undefined), email: (user ? user.data.email : undefined)});
    };
};

exports.retrieveUserList = function() {
    return function(req, res, next){
        models.User.findAll().success(function(users) {
            var usersWithLoginStatus = utils.queryResultToJson(users);
            usersWithLoginStatus.data.forEach(function(user) {
                user.token = insecurity.authenticatedUsers.tokenOf(user);
            });
            res.json(usersWithLoginStatus);
        }).error(function (error) {
            next(error);
        });
    };
};