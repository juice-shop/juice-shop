/* jslint node: true */
'use strict'

module.exports = (sequelize, DataTypes) => {
  const BasketItem = sequelize.define('BasketItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: DataTypes.INTEGER
  }
    )
  return BasketItem
}
