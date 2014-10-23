/*jslint node: true */
'use strict';

module.exports = function (sequelize, DataTypes) {
    var BasketItem = sequelize.define('BasketItems', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            quantity: DataTypes.INTEGER
        }, {
            classMethods: {
                associate: function (models) {
                    models.Basket.hasMany(models.Product, {through: BasketItem});
                    models.Product.hasMany(models.Basket, {through: BasketItem});
                }}}
    );
    return BasketItem;
};