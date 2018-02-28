/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      set (description) {
        if (utils.notSolved(challenges.restfulXssChallenge) && utils.contains(description, '<script>alert("XSS")</script>')) {
          utils.solve(challenges.restfulXssChallenge)
        }
        this.setDataValue('description', description)
      }
    },
    price: DataTypes.DECIMAL,
    image: DataTypes.STRING
  }, { paranoid: true })

  Product.associate = models => {
    Product.belongsToMany(models.Basket, { through: models.BasketItem })
  }

  return Product
}
