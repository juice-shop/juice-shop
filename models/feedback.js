/* jslint node: true */
const insecurity = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define('Feedback', {
    comment: {
        type: DataTypes.STRING,
        set(comment) {
            this.setDataValue('answer', insecurity.sanitizeHtml(comment));
            if (utils.notSolved(challenges.persistedXssChallengeFeedback) && utils.contains(comment, '<script>alert("XSS4")</script>')) {
              utils.solve(challenges.persistedXssChallengeFeedback)
            }
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        set(rating) {
            this.setDataValue('rating', insecurity.sanitizeHtml(rating));
            if (utils.notSolved(challenges.zeroStarsChallenge) && (rating === 0 || rating === undefined)) {
              utils.solve(challenges.zeroStarsChallenge)
            }
        }
    }
  },
    {
      classMethods: {
        associate: function (models) {
          Feedback.belongsTo(models.User) // no FK constraint to allow anonymous feedback posts
        }
      }
    })
  return Feedback
}
