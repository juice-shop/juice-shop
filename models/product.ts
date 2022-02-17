/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import utils = require("../lib/utils");
const security = require("../lib/insecurity");
const challenges = require("../data/datacache").challenges;
import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  DataTypes,
  CreationOptional,
  HasManyCreateAssociationMixin,
  NonAttribute,
} from "sequelize";
import { sequelize } from "./index";
import BasketItemModel from "./basketitem";
import BasketModel from "./basket";

class ProductModel extends Model<
  InferAttributes<ProductModel>,
  InferCreationAttributes<ProductModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string;
  declare price: number;
  declare deluxePrice: number;
  declare image: string;
  declare BasketItem?: NonAttribute<BasketItemModel>; // Note this is optional since it's only populated when explicitly requested in code

}

ProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      set(description: string) {
        if (!utils.disableOnContainerEnv()) {
          utils.solveIf(challenges.restfulXssChallenge, () => {
            return utils.contains(
              description,
              '<iframe src="javascript:alert(`xss`)">'
            );
          });
        } else {
          description = security.sanitizeSecure(description);
        }
        this.setDataValue("description", description);
      },
    },
    price: DataTypes.DECIMAL,
    deluxePrice: DataTypes.DECIMAL,
    image: DataTypes.STRING,
  },
  {
    tableName: "Product",
    sequelize,
  }
);

ProductModel.belongsToMany(BasketModel, {
  through: BasketItemModel,
  foreignKey: {
    name: "ProductId",
    // noUpdate: true
    //TODO
  },
});

export default ProductModel;

// module.exports = (sequelize, { STRING, DECIMAL }) => {
//     const Product = sequelize.define(
//         "Product",
//         {
//             name: STRING,
//             description: {
//                 type: STRING,
//                 set(description) {
//                     if (!utils.disableOnContainerEnv()) {
//                         utils.solveIf(challenges.restfulXssChallenge, () => {
//                             return utils.contains(
//                                 description,
//                                 '<iframe src="javascript:alert(`xss`)">'
//                             );
//                         });
//                     } else {
//                         description = security.sanitizeSecure(description);
//                     }
//                     this.setDataValue("description", description);
//                 },
//             },
//             price: DECIMAL,
//             deluxePrice: DECIMAL,
//             image: STRING,
//         },
//         { paranoid: true }
//     );

//     Product.associate = ({ Basket, BasketItem }) => {
//         Product.belongsToMany(Basket, {
//             through: BasketItem,
//             foreignKey: { name: "ProductId", noUpdate: true },
//         });
//     };

//     return Product;
// };
