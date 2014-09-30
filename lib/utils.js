/*jslint node: true */
'use strict';

var crypto = require('crypto');

function hash(data) {
    return crypto.createHash("md5").update(data).digest("hex");
}
exports.hash = hash;