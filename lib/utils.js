/*jslint node: true */
'use strict';

var crypto = require('crypto');

function hash(data) {
    return crypto.createHash("md5").update(data).digest("hex");
}
exports.hash = hash;

function queryResultToJson(data, status) {
    var wrappedData = {};
    if (data) {
        if (!data.length && data.dataValues) {
            wrappedData = data.dataValues;
        } else if (data.length > 0) {
            wrappedData = [];
            for (var i=0; i<data.length; i++) {
                if (data[i].dataValues) {
                    wrappedData.push(data[i].dataValues);
                } else {
                    wrappedData.push(data[i]);
                }
            }
        } else {
            wrappedData = data;
        }
    }
    return {
        status: status || 'success',
        data: wrappedData
    };
}
exports.queryResultToJson = queryResultToJson;