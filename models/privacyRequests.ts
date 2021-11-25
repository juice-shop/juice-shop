/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { INTEGER, BOOLEAN }) => {
  const PrivacyRequest = sequelize.define('PrivacyRequest', {
    UserId: { type: INTEGER },
    deletionRequested: { type: BOOLEAN, defaultValue: false }
  })

  PrivacyRequest.associate = ({ User }) => {
    PrivacyRequest.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return PrivacyRequest
}
