/*jslint node: true */
'use strict';

exports.queryResultToJson = function(data, status) {
    var wrappedData = {};
    if (data) {
        if (!data.length && data.dataValues) {
            wrappedData = data.dataValues;
        } else if (data.length > 0) {
            wrappedData = [];
            for (var i=0; i<data.length; i++) {
                wrappedData.push(data[i].dataValues ? data[i].dataValues : data[i]);
            }
        } else {
            wrappedData = data;
        }
    }
    return {
        status: status || 'success',
        data: wrappedData
    };
};

exports.startsWith = function(str, prefix) {
    return str.indexOf(prefix) === 0;
};

exports.endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

exports.contains = function(str, element) {
    return str.indexOf(element) !== -1;
};

exports.unquote = function(str) {
    if (str && this.startsWith(str, '"') && this.endsWith(str, '"')) {
        return str.substring(1, str.length-1);
    }
    else {
        return str;
    }
};