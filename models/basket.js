/*jslint node: true */
'use strict';

module.exports = function (sequelize, DataTypes) {
    var Basket = sequelize.define('Basket', {
        },
        {
            classMethods: {
                associate: function (models) {
                    Basket.belongsTo(models.User);
                }}}
    );
    return Basket;
};