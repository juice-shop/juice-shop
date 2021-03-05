/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)

describe('webhook', () => {
  const webhook = require('../../lib/webhook')

  const challenge = {
    key: 'key',
    name: 'name',
    difficulty: 1
  }

  describe('notify', () => {
    it('fails when no webhook URL is provided via environment variable', () => {
      expect(webhook.notify(challenge)).to.eventually.throw('options.uri is a required argument')
    })

    it('fails when supplied webhook is not a valid URL', () => {
      expect(webhook.notify(challenge, 0, 'localhorst')).to.eventually.throw('Invalid URI "localhorst"')
    })

    it('submits POST with payload to existing URL', () => {
      expect(webhook.notify(challenge, 0, 'https://enlm7zwniuyah.x.pipedream.net/')).to.eventually.not.throw()
    })
  })
})
