module.exports = (sequelize, { FLOAT, STRING }) => {
  const Delivery = sequelize.define('Delivery', {
    name: STRING,
    price: FLOAT,
    primePrice: FLOAT,
    eta: FLOAT
  })

  return Delivery
}
