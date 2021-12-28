/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
export = (sequelize, { STRING, INTEGER }) => {
  const Address = sequelize.define('Address', {
    fullName: STRING,
    mobileNum: {
      type: INTEGER,
      validate: {
        isInt: true,
        min: 1000000,
        max: 9999999999
      }
    },
    zipCode: {
      type: STRING,
      validate: {
        len: [1, 8]
      }
    },
    streetAddress: {
      type: STRING,
      validate: {
        len: [1, 160]
      }
    },
    city: STRING,
    state: STRING,
    country: STRING
  })

  Address.associate = ({ User }) => {
    Address.belongsTo(User, { constraints: true, foreignKeyConstraint: true })
  }

  return Address
}
