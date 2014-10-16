/*jslint node: true */
'use strict';

var crypto = require('crypto'),
    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    sanitizeHtml = require('sanitize-html'),
    utils = require('./utils');

var defaultSecret = 'too.short';
exports.defaultSecret = defaultSecret;

exports.hash = function(data) {
    return crypto.createHash('md5').update(data).digest('hex');
};

exports.cutOffPoisonNullByte = function(str) {
    var nullByte = '%00';
    if (utils.contains(str, nullByte)) {
        return str.substring(0, str.indexOf(nullByte));
    }
    return str;
};

exports.isAuthorized = function(role) {
    return expressJwt({secret: role || defaultSecret});
};

exports.denyAll = function() {
    return expressJwt({secret: ''+Math.random()});
};

exports.authorize = function(user, role) {
    return jwt.sign(user || {}, role || defaultSecret, { expiresInMinutes: 60*5 });
};

exports.sanitizeHtml = function(html) {
    return sanitizeHtml(html);
};

exports.authenticatedUsers = {
    userMap: {},
    put : function(token, user) {
        this.userMap[token] = user;
    },
    get: function(token) {
        if (token) {
            return this.userMap[utils.unquote(token)];
        } else {
            return undefined;
        }
    },
    from: function(req) {
        if (req.headers && req.headers.authorization) {
            var parts = req.headers.authorization.split(' ');
            if (parts.length == 2) {
                var scheme = parts[0];
                var token = parts[1];

                if (/^Bearer$/i.test(scheme)) {
                    return this.get(token);
                }
            }
        }
        return undefined;
    }
};
