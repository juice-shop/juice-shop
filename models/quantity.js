/* jslint node: true */
module.exports = (sequelize, { INTEGER }) => {
  const Quantity = sequelize.define('Quantity', {
    quantity: {
      type: INTEGER,
      validate: {
        isInt: true
      }
    }
  })

  Quantity.associate = ({ Product }) => {
    Quantity.belongsTo(Product, { constraints: true, foreignKeyConstraint: true })
  }

  return Quantity
}
