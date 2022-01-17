/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { INTEGER }) => {
  const Wallet = sequelize.define('Wallet', {
    balance: {
      type: INTEGER,
      validate: {
        isInt: true
      },
      defaultValue: 0
    }
  })

  Wallet.associate = ({ User }) => {
    Wallet.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Wallet
}
