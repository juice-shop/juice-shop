/*jslint node: true */
'use strict';

var crypto = require('crypto'),
    expressJwt = require('express-jwt'),
    jwt = require('jsonwebtoken'),
    utils = require('./utils');

var defaultSecret = 'too.short';
exports.defaultSecret = defaultSecret;

function hash(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}
exports.hash = hash;

function cutOffPoisonNullByte(str) {
    var nullByte = '%00';
    if (utils.contains(str, nullByte)) {
        return str.substring(0, str.indexOf(nullByte));
    }
    return str;
}
exports.cutOffPoisonNullByte = cutOffPoisonNullByte;

function isAuthorized(role) {
    return expressJwt({secret: role || defaultSecret});
}
exports.isAuthorized = isAuthorized;

function denyAll() {
    return expressJwt({secret: Math.random()});
}
exports.denyAll = denyAll;

function authorize(user, role) {
    return jwt.sign(user || {}, role || defaultSecret, { expiresInMinutes: 60*5 });
}
exports.authorize = authorize;