/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'
import { Joi } from 'frisby'

const REST_URL = 'http://localhost:3000/rest/web3'

describe('/submitKey', () => {
  it('POST missing key in request body gets rejected as non-Ethereum key', () => {
    return frisby.post(REST_URL + '/submitKey')
      .expect('status', 401)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Looks like you entered a non-Ethereum private key to access me.'
      })
  })

  it('POST arbitrary string in request body gets rejected as non-Ethereum key', () => {
    return frisby.post(REST_URL + '/submitKey', {
      privateKey: 'lalalala'
    })
      .expect('status', 401)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Looks like you entered a non-Ethereum private key to access me.'
      })
  })

  it('POST public wallet key in request body gets rejected as such', () => {
    return frisby.post(REST_URL + '/submitKey', {
      privateKey: '0x02c7a2a93289c9fbda5990bac6596993e9bb0a8d3f178175a80b7cfd983983f506'
    })
      .expect('status', 401)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Looks like you entered the public key of my ethereum wallet!'
      })
  })

  it('POST wallet address in request body gets rejected as such', () => {
    return frisby.post(REST_URL + '/submitKey', {
      privateKey: '0x8343d2eb2B13A2495De435a1b15e85b98115Ce05'
    })
      .expect('status', 401)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Looks like you entered the public address of my ethereum wallet!'
      })
  })

  it('POST private key in request body gets accepted', () => {
    return frisby.post(REST_URL + '/submitKey', {
      privateKey: '0x5bcc3e9d38baa06e7bfaab80ae5957bbe8ef059e640311d7d6d465e6bc948e3e'
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: true,
        message: 'Challenge successfully solved'
      })
  })
})

describe('/nftUnlocked', () => {
  it('GET solution status of "Unlock NFT" challenge', () => {
    return frisby.get(REST_URL + '/nftUnlocked')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', {
        status: Joi.boolean()
      })
  })
})

describe('/nftMintListen', () => {
  it('GET call confirms registration of event listener', () => {
    return frisby.get(REST_URL + '/nftMintListen')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: true,
        message: 'Event Listener Created'
      })
  })
})

describe('/walletNFTVerify', () => {
  it('POST missing wallet address fails to solve minting challenge', () => {
    return frisby.post(REST_URL + '/walletNFTVerify')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Wallet did not mint the NFT'
      })
  })

  it('POST invalid wallet address fails to solve minting challenge', () => {
    return frisby.post(REST_URL + '/walletNFTVerify', {
      walletAddress: 'lalalalala'
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: false,
        message: 'Wallet did not mint the NFT'
      })
  })
})

describe('/walletExploitAddress', () => {
  it('POST missing wallet address in request body still leads to success notification', () => {
    return frisby.post(REST_URL + '/walletExploitAddress')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: true,
        message: 'Event Listener Created'
      })
  })

  it('POST invalid wallet address in request body still leads to success notification', () => {
    return frisby.post(REST_URL + '/walletExploitAddress', {
      walletAddress: 'lalalalala'
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: true,
        message: 'Event Listener Created'
      })
  })

  it('POST self-referential address in request body leads to success notification', () => {
    return frisby.post(REST_URL + '/walletExploitAddress', {
      walletAddress: '0x413744D59d31AFDC2889aeE602636177805Bd7b0'
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', {
        success: true,
        message: 'Event Listener Created'
      })
  })
})
