/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    comment: DataTypes.STRING,
    rating: DataTypes.INTEGER
  },
    {
      classMethods: {
        associate: function (models) {
          Feedback.belongsTo(models.User) // no FK constraint to allow anonymous feedback posts
        }
      },

      hooks: {
        beforeCreate: function (feedback, fn) {
          htmlSanitizationHook(feedback)
          zeroFeedbackHook(feedback)
          fn(null, feedback)
        },
        beforeUpdate: function (feedback, fn) {
          htmlSanitizationHook(feedback)
          fn(null, feedback)
        }
      }
    })
  return Feedback
}

function htmlSanitizationHook (feedback) {
  feedback.comment = insecurity.sanitizeHtml(feedback.comment)
  if (utils.notSolved(challenges.persistedXssChallengeFeedback) && utils.contains(feedback.comment, '<script>alert("XSS4")</script>')) {
    utils.solve(challenges.persistedXssChallengeFeedback)
  }
}

function zeroFeedbackHook (feedback) {
  if (utils.notSolved(challenges.zeroStarsChallenge) && (feedback.rating === 0 || feedback.rating === undefined)) {
    utils.solve(challenges.zeroStarsChallenge)
  }
}
