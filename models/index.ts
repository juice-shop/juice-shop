/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
const sequelizeNoUpdateAttributes = require('sequelize-notupdate-attributes')
const Sequelize = require('sequelize')

const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  retry: {
    match: [/SQLITE_BUSY/],
    name: 'query',
    max: 5
  },
  transactionType: 'IMMEDIATE',
  storage: 'data/juiceshop.sqlite',
  logging: false
})
// console.log("seq obj",sequelize);

sequelizeNoUpdateAttributes(sequelize)
require("./relations")
// console.log("after seq obj",sequelize);

export { sequelize }
