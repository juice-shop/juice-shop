/*jslint node: true */
'use strict';

exports = module.exports = function fileUpload() {
    return function (req, res) {
        // TODO: Verify if req.file.size was >1MB --> Cient side size limit was bypassed
        // TODO: Verify if req.file.name ends with != .pdf --> Cient side file filter was bypassed
        res.status(204).end();
    };
};