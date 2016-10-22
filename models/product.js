/* jslint node: true */
'use strict'

var utils = require('../lib/utils')
var challenges = require('../data/datacache').challenges

module.exports = function (sequelize, DataTypes) {
  var Product = sequelize.define('Product', {
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
