/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import utils = require('../lib/utils')
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

module.exports = (sequelize, { STRING, INTEGER }) => {
  const Feedback = sequelize.define('Feedback', {
    comment: {
      type: STRING,
      set (comment) {
        let sanitizedComment
        if (!utils.disableOnContainerEnv()) {
          sanitizedComment = security.sanitizeHtml(comment)
          utils.solveIf(challenges.persistedXssFeedbackChallenge, () => { return utils.contains(sanitizedComment, '<iframe src="javascript:alert(`xss`)">') })
        } else {
          sanitizedComment = security.sanitizeSecure(comment)
        }
        this.setDataValue('comment', sanitizedComment)
      }
    },
    rating: {
      type: INTEGER,
      allowNull: false,
      set (rating) {
        this.setDataValue('rating', rating)
        utils.solveIf(challenges.zeroStarsChallenge, () => { return rating === 0 })
      }
    }
  })

  Feedback.associate = ({ User }) => {
    Feedback.belongsTo(User) // no FK constraint to allow anonymous feedback posts
  }

  return Feedback
}
