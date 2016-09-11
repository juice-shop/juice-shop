/* jslint node: true */
'use strict'

module.exports = function (sequelize, DataTypes) {
  var Basket = sequelize.define('Basket', {
    coupon: DataTypes.STRING
  },
    {
      classMethods: {
        associate: function (models) {
          Basket.belongsTo(models.User)
          Basket.hasMany(models.Product, {through: models.BasketItem})
        }}}
    )
  return Basket
}
