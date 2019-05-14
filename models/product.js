/* jslint node: true */
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING, DECIMAL, INTEGER }) => {
  const Product = sequelize.define('Product', {
    name: STRING,
    description: {
      type: STRING,
      set (description) {
        if (utils.notSolved(challenges.restfulXssChallenge) && utils.contains(description, '<iframe src="javascript:alert(`xss`)">')) {
          utils.solve(challenges.restfulXssChallenge)
        }
        this.setDataValue('description', description)
      }
    },
    price: DECIMAL,
    quantity: INTEGER,
    image: STRING
  }, { paranoid: true })

  Product.associate = ({ Basket, BasketItem }) => {
    Product.belongsToMany(Basket, { through: BasketItem, foreignKey: { name: 'ProductId', noUpdate: true } })
  }

  return Product
}
