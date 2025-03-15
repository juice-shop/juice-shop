/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as webhook from '../../lib/webhook'
import chai from 'chai'
import http from 'http'
import { type AddressInfo } from 'net'
const expect = chai.expect

describe('webhook', () => {
  const challenge = {
    key: 'key',
    name: 'name',
    difficulty: 1
  }

  describe('notify', () => {
    it('ignores errors where no webhook URL is provided via environment variable', async () => {
      try {
        await webhook.notify(challenge)
      } catch (error) {
        chai.assert.fail('Expected error was not thrown')
      }
    })

    it('fails when supplied webhook is not a valid URL', async () => {
      try {
        await webhook.notify(challenge, 0, 'localhorst')
        chai.assert.fail('Expected error was not thrown')
      } catch (error) {
        expect((error as Error).message).to.equal('Invalid URI "localhorst"')
      }
    })

    it('submits POST with payload to existing URL', async () => {
      const server = http.createServer((req, res) => {
        res.statusCode = 200
        res.end('OK')
      })

      await new Promise<void>((resolve) => server.listen(0, resolve))

      const port = (server.address() as AddressInfo)?.port
      const url = `http://localhost:${port}`

      try {
        await webhook.notify(challenge, 0, url)
      } finally {
        server.close()
      }
    })
  })
})
