/* jslint node: true */
'use strict'

module.exports = function (sequelize, DataTypes) {
  var Recycle = sequelize.define('Recycle', {
    quantity: DataTypes.INTEGER,
    address: DataTypes.STRING,
    isPickup: DataTypes.BOOLEAN,
    date: DataTypes.DATE
  },
    {
      classMethods: {
        associate: function (models) {
          Recycle.belongsTo(models.User)
        }
      }
    })
  return Recycle
}
