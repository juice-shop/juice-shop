/* jslint node: true */
module.exports = (sequelize, { INTEGER }) => {
  const PurchaseQuantity = sequelize.define('PurchaseQuantity', {
    quantity: {
      type: INTEGER,
      validate: {
        isInt: true
      }
    }
  })

  PurchaseQuantity.associate = ({ Product, User }) => {
    PurchaseQuantity.belongsTo(Product, { constraints: true, foreignKeyConstraint: true })
    PurchaseQuantity.belongsTo(User)
  }

  return PurchaseQuantity
}
