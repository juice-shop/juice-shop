/*jslint node: true */
'use strict';

exports = module.exports = function retrieveAppVersion() {
    return function (req, res, next) {
        console.log(req.body);
        console.log(req.file);
        res.status(204).end();
    };
};