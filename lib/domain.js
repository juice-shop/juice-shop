/*jslint node: true */
'use strict';

var Sequelize = require('sequelize'),
    sequelize = new Sequelize('database', 'username', 'password', {
        dialect: 'sqlite',
        storage: 'data/juiceshop.sqlite'
    });

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;