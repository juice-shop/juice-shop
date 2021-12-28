/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')

module.exports = function securityQuestion () {
  return ({ query }, res, next) => {
    const email = query.email
    models.SecurityAnswer.findOne({
      include: [{
        model: models.User,
        where: { email }
      }]
    }).then(answer => {
      if (answer) {
        models.SecurityQuestion.findByPk(answer.SecurityQuestionId).then(question => {
          res.json({ question })
        }).catch(error => {
          next(error)
        })
      } else {
        res.json({})
      }
    }).catch(error => {
      next(error)
    })
  }
}
