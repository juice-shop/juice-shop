/*jslint node: true */
'use strict';

function queryResultToJson(data, status) {
    var wrappedData = {};
    if (data) {
        if (!data.length && data.dataValues) {
            wrappedData = data.dataValues;
        } else if (data.length > 0) {
            wrappedData = [];
            for (var i=0; i<data.length; i++) {
                wrappedData.push(data[i]);
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

function startsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}
exports.startsWith = startsWith;

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
exports.endsWith = endsWith;

function contains(str, element) {
    return str.indexOf(element) !== -1;
}
exports.contains = contains;