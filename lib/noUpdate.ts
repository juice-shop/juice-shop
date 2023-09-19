// Credit for the implementation in JS: https://github.com/daviddossantos/sequelize-notupdate-attributes
import { type Model, type ValidationErrorItemType } from 'sequelize/types'
import { type ValidationOptions } from 'sequelize/types/instance-validator'

interface ExtendedValidationOptions extends ValidationOptions {
  validate: boolean
}

interface ExtendedModel extends Model {
  _changed: Iterable<string> | ArrayLike<string>
  rawAttributes: Record<string, any>
  _previousDataValues: Record<string, null>
}

const {
  ValidationError,
  ValidationErrorItem
} = require('sequelize/lib/errors')

export const makeKeyNonUpdatable = (model: Model, column: string) => {
  model.addHook('beforeValidate', (instance: ExtendedModel, options: ExtendedValidationOptions) => {
    if (!options.validate) return

    if (instance.isNewRecord) return

    const changedKeys: unknown[] = []

    const instanceChanged = Array.from(instance._changed)

    instanceChanged.forEach((value) => changedKeys.push(value))

    if (changedKeys.length === 0) return

    const validationErrors: ValidationErrorItemType[] = []

    changedKeys.forEach((fieldName: any) => {
      const fieldDefinition = instance.rawAttributes[fieldName]

      if (
        instance._previousDataValues[fieldName] !== undefined &&
        instance._previousDataValues[fieldName] !== null &&
        (fieldDefinition.fieldName === column)
      ) {
        validationErrors.push(
          new ValidationErrorItem(
            `\`${fieldName}\` cannot be updated due \`noUpdate\` constraint`,
            'noUpdate Violation',
            fieldName
          )
        )
      }
    })

    if (validationErrors.length > 0) { throw new ValidationError(null, validationErrors) }
  })
}
