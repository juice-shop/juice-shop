/* jslint node: true */
const insecurity = require('../lib/insecurity')

module.exports = (sequelize, DataTypes) => {
  const SecurityAnswer = sequelize.define('SecurityAnswer', {
    answer: DataTypes.STRING,
    UserId: {type: DataTypes.INTEGER, unique: true}
  },
    {
      classMethods: {
        associate: function (models) {
          SecurityAnswer.belongsTo(models.User)
          SecurityAnswer.belongsTo(models.SecurityQuestion, { constraints: true, foreignKeyConstraint: true })
        }
      },
      hooks: {
        beforeCreate: function (answer, fn) {
          hmacAnswerHook(answer)
          fn(null, answer)
        },
        beforeUpdate: function (answer, fn) { // Pitfall: Will hash the hashed answer again if answer was not updated!
          hmacAnswerHook(answer)
          fn(null, answer)
        }
      }
    })
  return SecurityAnswer
}

function hmacAnswerHook (answer) {
  if (answer.answer) {
    answer.answer = insecurity.hmac(answer.answer)
  };
}
