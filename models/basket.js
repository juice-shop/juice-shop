/* jslint node: true */
'use strict'

module.exports = function (sequelize, DataTypes) {
  const Basket = sequelize.define('Basket', {
    coupon: DataTypes.STRING
  },
    {
      classMethods: {
        associate: function (models) {
          Basket.belongsTo(models.User, { constraints: true, foreignKeyConstraint: true })
          Basket.hasMany(models.Product, {through: models.BasketItem})
        }}}
    )
  return Basket
}
