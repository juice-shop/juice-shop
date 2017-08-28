/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    image: DataTypes.STRING
  }, {
    paranoid: true,
    classMethods: {
      associate: function (models) {
        Product.hasMany(models.Basket, {through: models.BasketItem})
      }},

    hooks: {
      beforeCreate: function (product, fn) {
        xssChallengeProductHook(product)
        fn(null, product)
      },
      beforeUpdate: function (product, fn) {
        xssChallengeProductHook(product)
        fn(null, product)
      }
    }})
  return Product
}

function xssChallengeProductHook (product) {
  if (utils.notSolved(challenges.restfulXssChallenge) && utils.contains(product.description, '<script>alert("XSS3")</script>')) {
    utils.solve(challenges.restfulXssChallenge)
  }
}
