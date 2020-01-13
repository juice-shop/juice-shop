/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')
const replace = require('replace')
const path = require('path')
const fs = require('fs-extra')
const NodeRSA = require('node-rsa')

const generateEncryptedAnnouncement = () => {
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/announcement.md'), path.resolve(__dirname, '../../ftp/announcement.md'))
  if (config.has('application.altcoinName')) {
    replaceTokenName(config.get('application.altcoinName'))
  }
  const key = new NodeRSA()
  key.importKey({
    n: Buffer.from('145906768007583323230186939349070635292401872375357164399581871019873438799005358938369571402670149802121818086292467422828157022922076746906543401224889672472407926969987100581290103199317858753663710862357656510507883714297115637342788911463535102712032765166518411726859837988672111837205085526346618740053'),
    e: 65537
  }, 'components-public')
  fs.writeFileSync(path.resolve(__dirname, '../../ftp/announcement_encrypted.md'), key.encrypt(fs.readFileSync(path.resolve(__dirname, '../../ftp/announcement.md'))))
  fs.remove(path.resolve(__dirname, '../../ftp/announcement.md'))
}

const replaceTokenName = (altcoin) => {
  replace({
    regex: /Juicycoin/,
    replacement: altcoin,
    paths: ['ftp/announcement.md'],
    recursive: false,
    silent: true
  })
}

module.exports = generateEncryptedAnnouncement
