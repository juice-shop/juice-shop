/* jslint node: true */
module.exports = (sequelize, { INTEGER, STRING, BOOLEAN, DATE }) => {
  const Recycle = sequelize.define('Recycle', {
    quantity: INTEGER(4),
    address: STRING(180),
    isPickup: { type: BOOLEAN, defaultValue: false },
    date: DATE
  })

  Recycle.associate = ({ User }) => {
    Recycle.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Recycle
}
