/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import fs = require('fs')
import { Model } from 'sequelize'
const path = require('path')
const sequelizeNoUpdateAttributes = require('sequelize-notupdate-attributes')
const Sequelize = require('sequelize')
const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'sqlite',
  retry: {
    match: [
      /SQLITE_BUSY/
    ],
    name: 'query',
    max: 5
  },
  transactionType: 'IMMEDIATE',
  storage: 'data/juiceshop.sqlite',
  logging: false
})
sequelizeNoUpdateAttributes(sequelize)
const db: Database = { sequelize, Sequelize }

fs.readdirSync(__dirname)
  .filter(file => (file.match(/\.[jt]s$/) != null) && !file.includes('index.'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

module.exports = db

interface Database {
  sequelize: any
  Sequelize: any
  [key: string]: Model
}
