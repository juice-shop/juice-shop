/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING, INTEGER }) => {
  const Feedback = sequelize.define('Feedback', {
    comment: {
      type: STRING,
      set (comment) {
        const sanitizedComment = insecurity.sanitizeHtml(comment)
        this.setDataValue('comment', sanitizedComment)
        if (utils.notSolved(challenges.persistedXssFeedbackChallenge) && utils.contains(sanitizedComment, '<iframe src="javascript:alert(`xss`)">')) {
          utils.solve(challenges.persistedXssFeedbackChallenge)
        }
      }
    },
    rating: {
      type: INTEGER,
      allowNull: false,
      set (rating) {
        this.setDataValue('rating', rating)
        if (utils.notSolved(challenges.zeroStarsChallenge) && rating === 0) {
          utils.solve(challenges.zeroStarsChallenge)
        }
      }
    }
  })

  Feedback.associate = ({ User }) => {
    Feedback.belongsTo(User) // no FK constraint to allow anonymous feedback posts
  }

  return Feedback
}
