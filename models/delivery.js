module.exports = (sequelize, { FLOAT, STRING }) => {
  const Delivery = sequelize.define('Delivery', {
    name: STRING,
    price: FLOAT,
    deluxePrice: FLOAT,
    eta: FLOAT
  })

  return Delivery
}
