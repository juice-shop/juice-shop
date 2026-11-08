/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { HDNodeWallet } from 'ethers'
import { challenges } from '../../data/datacache'
import { type Challenge } from '@juice-shop/data/types'
import { checkKeys, nftUnlocked } from '../../routes/checkKeys'

const mnemonic = 'purpose betray marriage blame crunch monitor spin slide donate sport lift clutch'
const wallet = HDNodeWallet.fromPhrase(mnemonic)

void describe('checkKeys', () => {
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    req = { body: {} }
    res = { status: mock.fn(), json: mock.fn() }
    res.status.mock.mockImplementation(() => res)
    save = () => ({
      then () { }
    })
    challenges.nftUnlockChallenge = { solved: false, save } as unknown as Challenge
  })

  void it('solves "nftUnlockChallenge" and returns 200 for the correct private key', async () => {
    req.body.privateKey = wallet.privateKey

    await checkKeys()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 200)
    assert.equal(res.json.mock.calls[0].arguments[0].success, true)
    assert.equal(challenges.nftUnlockChallenge.solved, true)
  })

  void it('returns 401 hinting at the public address when the address is submitted', async () => {
    req.body.privateKey = wallet.address

    await checkKeys()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 401)
    assert.match(res.json.mock.calls[0].arguments[0].message, /public address/)
    assert.equal(challenges.nftUnlockChallenge.solved, false)
  })

  void it('returns 401 hinting at the public key when the public key is submitted', async () => {
    req.body.privateKey = wallet.publicKey

    await checkKeys()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 401)
    assert.match(res.json.mock.calls[0].arguments[0].message, /public key/)
    assert.equal(challenges.nftUnlockChallenge.solved, false)
  })

  void it('returns 401 for a non-Ethereum private key', async () => {
    req.body.privateKey = 'not-a-key'

    await checkKeys()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 401)
    assert.match(res.json.mock.calls[0].arguments[0].message, /non-Ethereum private key/)
    assert.equal(challenges.nftUnlockChallenge.solved, false)
  })
})

void describe('nftUnlocked', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = { body: {} }
    res = { status: mock.fn(), json: mock.fn() }
    res.status.mock.mockImplementation(() => res)
    challenges.nftUnlockChallenge = { solved: false } as unknown as Challenge
  })

  void it('returns the solved status of "nftUnlockChallenge"', () => {
    challenges.nftUnlockChallenge.solved = true

    nftUnlocked()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 200)
    assert.equal(res.json.mock.calls[0].arguments[0].status, true)
  })

  void it('returns false while "nftUnlockChallenge" is unsolved', () => {
    nftUnlocked()(req, res)

    assert.equal(res.status.mock.calls[0].arguments[0], 200)
    assert.equal(res.json.mock.calls[0].arguments[0].status, false)
  })

  void it('returns 500 when the challenge is missing', () => {
    // @ts-expect-error testing the missing-challenge path
    delete challenges.nftUnlockChallenge

    nftUnlocked()(req, res)

    const statusCalls = res.status.mock.calls
    assert.equal(statusCalls[statusCalls.length - 1].arguments[0], 500)
  })
})
