/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { makeKeyNonUpdatable } from '../../lib/noUpdate'

void describe('noUpdate', () => {
  void it('should throw an error when trying to update a non-updatable key', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')

    assert.equal(model.addHook.mock.calls.length, 1)
    assert.equal(model.addHook.mock.calls[0].arguments[0], 'beforeValidate')

    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {
      isNewRecord: false,
      _changed: ['testColumn'],
      rawAttributes: {
        testColumn: { fieldName: 'testColumn' }
      },
      _previousDataValues: {
        testColumn: 'oldValue'
      }
    }

    const options: any = { validate: true }

    assert.throws(() => {
      hook(instance, options)
    }, (err: any) => {
      return err.name === 'SequelizeValidationError' && err.errors[0].path === 'testColumn'
    })
  })

  void it('should not throw when the non-updatable key is not changed', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')
    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {
      isNewRecord: false,
      _changed: ['otherColumn'],
      rawAttributes: {
        otherColumn: { fieldName: 'otherColumn' }
      },
      _previousDataValues: {
        otherColumn: 'oldValue'
      }
    }

    const options: any = { validate: true }
    assert.doesNotThrow(() => {
      hook(instance, options)
    })
  })

  void it('should not throw when isNewRecord is true', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')
    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {
      isNewRecord: true,
      _changed: ['testColumn']
    }

    const options: any = { validate: true }
    assert.doesNotThrow(() => {
      hook(instance, options)
    })
  })

  void it('should not throw when validate option is false', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')
    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {}
    const options: any = { validate: false }
    assert.doesNotThrow(() => {
      hook(instance, options)
    })
  })

  void it('should not throw when there are no changed keys', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')
    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {
      isNewRecord: false,
      _changed: []
    }

    const options: any = { validate: true }
    assert.doesNotThrow(() => {
      hook(instance, options)
    })
  })

  void it('should not throw when previous value is null or undefined', () => {
    const model: any = {
      addHook: mock.fn()
    }
    makeKeyNonUpdatable(model, 'testColumn')
    const hook = model.addHook.mock.calls[0].arguments[1]

    const instance: any = {
      isNewRecord: false,
      _changed: ['testColumn'],
      rawAttributes: {
        testColumn: { fieldName: 'testColumn' }
      },
      _previousDataValues: {
        testColumn: null
      }
    }

    const options: any = { validate: true }
    assert.doesNotThrow(() => {
      hook(instance, options)
    })

    instance._previousDataValues.testColumn = undefined
    assert.doesNotThrow(() => {
      hook(instance, options)
    })
  })
})
