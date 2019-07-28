/* jslint node: true */
module.exports = (sequelize, { INTEGER }) => {
  const Wallet = sequelize.define('Wallet', {
    balance: {
      type: INTEGER,
      validate: {
        isInt: true
      },
      defaultValue: 0
    }
  })

  Wallet.associate = ({ User }) => {
    Wallet.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Wallet
}
