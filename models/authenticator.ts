/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

class Authenticator extends Model<
InferAttributes<Authenticator>,
InferCreationAttributes<Authenticator>
> {
  declare id: CreationOptional<number>
  declare UserId: number
  declare credentialID: string
  declare publicKey: string // base64url-encoded COSE public key
  declare counter: CreationOptional<number>
  declare transports: CreationOptional<string> // comma-separated list
  declare aaguid: CreationOptional<string> // identifies the passkey provider, all zeros if not disclosed
  declare createdAt: CreationOptional<Date>
}

const AuthenticatorModelInit = (sequelize: Sequelize) => {
  Authenticator.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      UserId: {
        type: DataTypes.INTEGER
      },
      credentialID: {
        type: DataTypes.STRING
      },
      publicKey: {
        type: DataTypes.STRING
      },
      counter: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      transports: {
        type: DataTypes.STRING,
        defaultValue: ''
      },
      aaguid: {
        type: DataTypes.STRING,
        defaultValue: '00000000-0000-0000-0000-000000000000'
      },
      createdAt: DataTypes.DATE
    },
    {
      tableName: 'Authenticators',
      sequelize
    }
  )
}

export { Authenticator as AuthenticatorModel, AuthenticatorModelInit }
