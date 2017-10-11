/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    comment: {
      type: DataTypes.STRING,
      set (comment) {
        const sanitizedComment = insecurity.sanitizeHtml(comment);
        this.setDataValue('comment', sanitizedComment)
        if (utils.notSolved(challenges.persistedXssChallengeFeedback) && utils.contains(sanitizedComment, '<script>alert("XSS4")</script>')) {
          utils.solve(challenges.persistedXssChallengeFeedback)
        }
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      set (rating) {
        this.setDataValue('rating', rating)
        if (utils.notSolved(challenges.zeroStarsChallenge) && (rating === 0 || rating === undefined)) {
          utils.solve(challenges.zeroStarsChallenge)
        }
      }
    }
  })

  Feedback.associate = function (models) {
    Feedback.belongsTo(models.User) // no FK constraint to allow anonymous feedback posts
  }

  return Feedback
}
