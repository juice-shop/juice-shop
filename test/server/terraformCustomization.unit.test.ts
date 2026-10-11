/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import config from 'config'
import { customizeTerraformContent } from '../../lib/terraformCustomization'

void describe('terraformCustomization', () => {
  void it('should customize Terraform resource names for a custom application name', (t) => {
    t.mock.method(config, 'get', () => 'Cider & Sons')

    const content = customizeTerraformContent('resource "juice_shop" "juice-shop" {}')

    assert.equal(content, 'resource "cider_sons" "cider-sons" {}')
  })

  void it('should leave Terraform content unchanged for the default application name', (t) => {
    t.mock.method(config, 'get', () => 'OWASP Juice Shop')

    const content = customizeTerraformContent('resource "juice_shop" "juice-shop" {}')

    assert.equal(content, 'resource "juice_shop" "juice-shop" {}')
  })
})
