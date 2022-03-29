/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import utils = require('../lib/utils')

import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

class Feedback extends Model<
InferAttributes<Feedback>,
InferCreationAttributes<Feedback>
> {
  declare UserId: number | null
  declare id: CreationOptional<number>
  declare comment: string
  declare rating: number
}
const FeedbackModelInit = (sequelize: Sequelize) => {
  Feedback.init(
    {
      UserId: {
        type: DataTypes.INTEGER
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      comment: {
        type: DataTypes.STRING,
        set (comment: string) {
          let sanitizedComment: string
          if (!utils.disableOnContainerEnv()) {
            sanitizedComment = security.sanitizeHtml(comment)
            utils.solveIf(challenges.persistedXssFeedbackChallenge, () => {
              return utils.contains(
                sanitizedComment,
                '<iframe src="javascript:alert(`xss`)">'
              )
            })
          } else {
            sanitizedComment = security.sanitizeSecure(comment)
          }
          this.setDataValue('comment', sanitizedComment)
        }
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        set (rating: number) {
          this.setDataValue('rating', rating)
          utils.solveIf(challenges.zeroStarsChallenge, () => {
            return rating === 0
          })
        }
      }
    },
    {
      tableName: 'Feedbacks',
      sequelize
    }
  )
}

export { Feedback as FeedbackModel, FeedbackModelInit }
