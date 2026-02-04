/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import {
    Model,
    type InferAttributes,
    type InferCreationAttributes,
    DataTypes,
    type CreationOptional,
    type Sequelize
} from 'sequelize'

class Bounty extends Model<
    InferAttributes<Bounty>,
    InferCreationAttributes<Bounty>
> {
    declare UserId: number
    declare id: CreationOptional<number>
    declare challengeKey: string
}

const BountyModelInit = (sequelize: Sequelize) => {
    Bounty.init(
        {
            UserId: {
                type: DataTypes.INTEGER
            },
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            challengeKey: {
                type: DataTypes.STRING
            }
        },
        {
            tableName: 'Bounties',
            sequelize
        }
    )
}

export { Bounty as BountyModel, BountyModelInit }
