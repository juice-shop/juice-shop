/* jslint node: true */
module.exports = (sequelize, { INTEGER, BOOLEAN, DATE }) => {
  const Recycle = sequelize.define('Recycle', {
    quantity: INTEGER(4),
    isPickup: { type: BOOLEAN, defaultValue: false },
    date: DATE
  })

  Recycle.associate = ({ User, Address }) => {
    Recycle.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
    Recycle.belongsTo(Address, { constraints: true, foreignKeyConstraint: true })
  }

  return Recycle
}
