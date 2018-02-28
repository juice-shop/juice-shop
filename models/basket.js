/* jslint node: true */
module.exports = (sequelize, DataTypes) => {
  const Basket = sequelize.define('Basket', {
    coupon: DataTypes.STRING
  })

  Basket.associate = models => {
    Basket.belongsTo(models.User, { constraints: true, foreignKeyConstraint: true })
    Basket.belongsToMany(models.Product, { through: models.BasketItem })
  }

  return Basket
}
