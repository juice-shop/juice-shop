/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */
require('./lib/startup/validateDependencies')().then(function () {
    var server = require('./server');
    server.start();
});
