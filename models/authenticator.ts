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
  // credentialID is intentionally NOT declared unique: a UNIQUE constraint here would silently
  // mitigate the "Passkey Credential Overwrite" challenge (CWE-639). See routes/webauthn.ts.
  declare credentialID: string
  declare publicKey: string // base64url-encoded COSE public key
  declare counter: CreationOptional<number>
  declare transports: CreationOptional<string> // comma-separated list
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
      }
    },
    {
      tableName: 'Authenticators',
      sequelize
    }
  )
}

export { Authenticator as AuthenticatorModel, AuthenticatorModelInit }
