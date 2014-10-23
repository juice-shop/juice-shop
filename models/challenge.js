/*jslint node: true */
'use strict';

module.exports = function (sequelize, DataTypes) {
    var Challenge = sequelize.define('Challenges', {
        description: DataTypes.STRING,
        solved: DataTypes.BOOLEAN
    });
    return Challenge;
};