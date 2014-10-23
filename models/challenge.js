/*jslint node: true */
'use strict';

module.exports = function (sequelize, DataTypes) {
    var Challenge = sequelize.define('Challenge', {
        description: DataTypes.STRING,
        solved: DataTypes.BOOLEAN
    });
    return Challenge;
};