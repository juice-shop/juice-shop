/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import config = require("config");
import { sequelize } from "./index";
import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  CreationOptional,
} from "sequelize";
const security = require("../lib/insecurity");
const utils = require("../lib/utils");
const challenges = require("../data/datacache").challenges;

class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: CreationOptional<number>;
  declare username: string | undefined;
  declare email: CreationOptional<string>;
  declare password: CreationOptional<string>;
  declare role: CreationOptional<string>;
  declare deluxeToken: CreationOptional<string>;
  declare lastLoginIp: CreationOptional<string>;
  declare profileImage: CreationOptional<string>;
  declare totpSecret: CreationOptional<string>;
  declare isActive: CreationOptional<boolean>;
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      defaultValue: "",
      set(username: string) {
        if (!utils.disableOnContainerEnv()) {
          username = security.sanitizeLegacy(username);
        } else {
          username = security.sanitizeSecure(username);
        }
        this.setDataValue("username", username);
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      set(email: string) {
        if (!utils.disableOnContainerEnv()) {
          utils.solveIf(challenges.persistedXssUserChallenge, () => {
            return utils.contains(
              email,
              '<iframe src="javascript:alert(`xss`)">'
            );
          });
        } else {
          email = security.sanitizeSecure(email);
        }
        this.setDataValue("email", email);
      },
    },
    password: {
      type: DataTypes.STRING,
      set(clearTextPassword) {
        this.setDataValue("password", security.hash(clearTextPassword));
      },
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "customer",
      validate: {
        isIn: [["customer", "deluxe", "accounting", "admin"]],
      },
      set(role: string) {
        const profileImage = this.getDataValue("profileImage");
        if (
          role === security.roles.admin &&
          (!profileImage ||
            profileImage === "/assets/public/images/uploads/default.svg")
        ) {
          this.setDataValue(
            "profileImage",
            "/assets/public/images/uploads/defaultAdmin.png"
          );
        }
        this.setDataValue("role", role);
      },
    },
    deluxeToken: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    lastLoginIp: {
      type: DataTypes.STRING,
      defaultValue: "0.0.0.0",
    },
    profileImage: {
      type: DataTypes.STRING,
      defaultValue: "/assets/public/images/uploads/default.svg",
    },
    totpSecret: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "User",
    sequelize,
  }
);

UserModel.addHook("afterValidate", (user: UserModel) => {
  if (
    user.email &&
    user.email.toLowerCase() ===
      `acc0unt4nt@${config.get("application.domain")}`.toLowerCase()
  ) {
    return Promise.reject(
      new Error(
        'Nice try, but this is not how the "Ephemeral Accountant" challenge works!'
      )
    );
  }
});

export default UserModel;

// module.exports = (sequelize, { STRING, BOOLEAN }) => {
//   const User = sequelize.define('User', {
//     username: {
//       type: STRING,
//       defaultValue: '',
//       set (username) {
//         if (!utils.disableOnContainerEnv()) {
//           username = security.sanitizeLegacy(username)
//         } else {
//           username = security.sanitizeSecure(username)
//         }
//         this.setDataValue('username', username)
//       }
//     },
//     email: {
//       type: STRING,
//       unique: true,
//       set (email) {
//         if (!utils.disableOnContainerEnv()) {
//           utils.solveIf(challenges.persistedXssUserChallenge, () => { return utils.contains(email, '<iframe src="javascript:alert(`xss`)">') })
//         } else {
//           email = security.sanitizeSecure(email)
//         }
//         this.setDataValue('email', email)
//       }
//     },
//     password: {
//       type: STRING,
//       set (clearTextPassword) {
//         this.setDataValue('password', security.hash(clearTextPassword))
//       }
//     },
//     role: {
//       type: STRING,
//       defaultValue: 'customer',
//       validate: {
//         isIn: [['customer', 'deluxe', 'accounting', 'admin']]
//       },
//       set (role) {
//         const profileImage = this.getDataValue('profileImage')
//         if (role === security.roles.admin && (!profileImage || profileImage === '/assets/public/images/uploads/default.svg')) {
//           this.setDataValue('profileImage', '/assets/public/images/uploads/defaultAdmin.png')
//         }
//         this.setDataValue('role', role)
//       }
//     },
//     deluxeToken: {
//       type: STRING,
//       defaultValue: ''
//     },
//     lastLoginIp: {
//       type: STRING,
//       defaultValue: '0.0.0.0'
//     },
//     profileImage: {
//       type: STRING,
//       defaultValue: '/assets/public/images/uploads/default.svg'
//     },
//     totpSecret: {
//       type: STRING,
//       defaultValue: ''
//     },
//     isActive: {
//       type: BOOLEAN,
//       defaultValue: true
//     }
//   }, { paranoid: true })

//   User.addHook('afterValidate', (user) => {
//     if (user.email && user.email.toLowerCase() === `acc0unt4nt@${config.get('application.domain')}`.toLowerCase()) {
//       return Promise.reject(new Error('Nice try, but this is not how the "Ephemeral Accountant" challenge works!'))
//     }
//   })

//   return User
// }
