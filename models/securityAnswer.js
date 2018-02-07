/* jslint node: true */
const insecurity = require('../lib/insecurity')

module.exports = (sequelize, DataTypes) => {
  const SecurityAnswer = sequelize.define('SecurityAnswer', {
    answer: {
      type: DataTypes.STRING,
      set (answer) {
        this.setDataValue('answer', insecurity.hmac(answer))
      }
    },
    UserId: { type: DataTypes.INTEGER, unique: true }
  })

  SecurityAnswer.associate = models => {
    SecurityAnswer.belongsTo(models.User)
    SecurityAnswer.belongsTo(models.SecurityQuestion, { constraints: true, foreignKeyConstraint: true })
  }

  return SecurityAnswer
}
