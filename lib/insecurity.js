/*jslint node: true */
'use strict';

var crypto = require('crypto'),
    utils = require('./utils');

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