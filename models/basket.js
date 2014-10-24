/*jslint node: true */
'use strict';

module.exports = function (sequelize) {
    var Basket = sequelize.define('Basket', {
        },
        {
            classMethods: {
                associate: function (models) {
                    Basket.belongsTo(models.User);
                    Basket.hasMany(models.Product, {through: models.BasketItem});
                }}}
    );
    return Basket;
};