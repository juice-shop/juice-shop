// TODO: :icensing
import { Model } from "sequelize/types";
import { ValidationOptions } from "sequelize/types/instance-validator";

interface ExtendedValidationOptions extends ValidationOptions{
  validate:boolean,
}

interface ExtendedModel extends Model{
  _changed:any, //TODO typecasting
  rawAttributes:any,
  _previousDataValues:any
}

const {
  ValidationError,
  ValidationErrorItem,
} = require('sequelize/lib/errors');

export const makeKeyNonUpdatable=(model:any, column:string)=>{ // TODO Model typecasting
  
  model.addHook('beforeValidate', (instance:ExtendedModel, options:ExtendedValidationOptions) => {
    if (!options.validate) return;

    if (instance.isNewRecord) return;

    const changedKeys: unknown[] = [];

    const instance_changed = Array.from(instance._changed);    

    instance_changed.forEach((value) => changedKeys.push(value));

    if (!changedKeys.length) return;

    const validationErrors: any[] = []; //TODO

    changedKeys.forEach((fieldName:any) => {
      const fieldDefinition = instance.rawAttributes[fieldName];
      
      // if (!fieldDefinition.noUpdate) return;     
      
      if (
        instance._previousDataValues[fieldName] !== undefined &&
        instance._previousDataValues[fieldName] !== null &&
        (fieldDefinition.fieldName===column)
      ) {
        validationErrors.push(
          new ValidationErrorItem(
            `\`${fieldName}\` cannot be updated due \`noUpdate\` constraint`,
            'noUpdate Violation',
            fieldName,
          )
        );
      }
    });

    if (validationErrors.length)
      throw new ValidationError(null, validationErrors);
  });
}