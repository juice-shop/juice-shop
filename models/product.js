/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      set (description) {
        if (utils.notSolved(challenges.restfulXssChallenge) && utils.contains(description, '<script>alert("XSS3")</script>')) {
          utils.solve(challenges.restfulXssChallenge)
        }
        this.setDataValue('description', description)
      }
    },
    price: DataTypes.DECIMAL,
    image: DataTypes.STRING
  }, {
    paranoid: true,
    classMethods: {
      associate: function (models) {
        Product.hasMany(models.Basket, { through: models.BasketItem })
      }
    }
  })
  return Product
}
