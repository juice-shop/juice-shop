import { Sequelize } from 'sequelize/types'
import { AddressModel } from './address'
import { BasketModel } from './basket'
import { BasketItemModel } from './basketitem'
import { CardModel } from './card'
import { ComplaintModel } from './complaint'
import { FeedbackModel } from './feedback'
import { ImageCaptchaModel } from './imageCaptcha'
import { MemoryModel } from './memory'
import { PrivacyRequestModel } from './privacyRequests'
import { ProductModel } from './product'
import { QuantityModel } from './quantity'
import { RecycleModel } from './recycle'
import { SecurityAnswerModel } from './securityAnswer'
import { SecurityQuestionModel } from './securityQuestion'
import { UserModel } from './user'
import { WalletModel } from './wallet'

import { makeKeyNonUpdatable } from '../lib/noUpdate'

const relationsInit = (_sequelize: Sequelize) => {
  AddressModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  BasketModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })
  BasketModel.belongsToMany(ProductModel, {
    through: BasketItemModel,
    as: 'Products',
    foreignKey: {
      name: 'BasketId'
      // TODO noUpdate: true
    }
  })
  makeKeyNonUpdatable(BasketItemModel, 'BasketId')

  CardModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  ComplaintModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  FeedbackModel.belongsTo(UserModel, {
    foreignKey: {
      name: 'UserId'
    }
  }) // no FK constraint to allow anonymous feedback posts

  ImageCaptchaModel.belongsTo(UserModel, {
    foreignKey: {
      name: 'UserId'
    }
  })

  MemoryModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  PrivacyRequestModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  ProductModel.belongsToMany(BasketModel, {
    through: BasketItemModel,
    foreignKey: {
      name: 'ProductId'
      // TODO noUpdate: true
    }
  })
  makeKeyNonUpdatable(BasketItemModel, 'ProductId')

  QuantityModel.belongsTo(ProductModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'ProductId'
    }
  })

  RecycleModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })
  RecycleModel.belongsTo(AddressModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'AddressId'
    }
  })

  SecurityAnswerModel.belongsTo(UserModel, {
    foreignKey: {
      name: 'UserId'
    }
  })
  SecurityAnswerModel.belongsTo(SecurityQuestionModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'SecurityQuestionId'
    }
  })

  WalletModel.belongsTo(UserModel, {
    constraints: true,
    foreignKeyConstraint: true,
    foreignKey: {
      name: 'UserId'
    }
  })

  // BasketItemModel.addHook('beforeValidate', (instance:ExtendedModel, options:ExtendedValidationOptions) => {
  //   if (!options.validate) return;

  //   if (instance.isNewRecord) return;

  //   const changedKeys: unknown[] = [];

  //   const instance_changed = Array.from(instance._changed);

  //   instance_changed.forEach((value) => changedKeys.push(value));

  //   if (!changedKeys.length) return;

  //   const validationErrors: any[] = []; //TODO

  //   changedKeys.forEach((fieldName:any) => {
  //     const fieldDefinition = instance.rawAttributes[fieldName];

  //     // if (!fieldDefinition.noUpdate) return;

  //     if (
  //       instance._previousDataValues[fieldName] !== undefined &&
  //       instance._previousDataValues[fieldName] !== null &&
  //       (fieldDefinition.fieldName==='ProductId' || fieldDefinition.fieldName==='BasketId')
  //     ) {
  //       validationErrors.push(
  //         new ValidationErrorItem(
  //           `\`${fieldName}\` cannot be updated due \`noUpdate\` constraint`,
  //           'noUpdate Violation',
  //           fieldName,
  //         )
  //       );
  //     }
  //   });

  //   if (validationErrors.length)
  //     throw new ValidationError(null, validationErrors);
  // });
}

export { relationsInit }
