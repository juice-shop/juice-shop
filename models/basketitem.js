/* jslint node: true */
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
