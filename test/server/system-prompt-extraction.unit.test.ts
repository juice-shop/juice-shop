/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { checkSystemPromptSimilarity } from '../../routes/verify'
import { buildSystemPrompt } from '../../routes/chat'
import { diceCoefficient } from '../../lib/utils'

const reference = buildSystemPrompt()

let keepAlive: NodeJS.Timeout
before(async () => { keepAlive = setTimeout(() => {}, 60000) })
after(async () => { clearTimeout(keepAlive) })

void describe('checkSystemPromptSimilarity', () => {
  void it('returns true for verbatim system prompt (score ~1.0)', async () => {
    assert.equal(checkSystemPromptSimilarity(reference, reference), true)
  })

  void it('returns true for near-verbatim submission with minor rewording (score > 0.25)', async () => {
    const submission = 'You are Juicy the Smart Assistant, the customer service chatbot of OWASP Juice Shop. ' +
      'IMPORTANT RULES: Use searchProducts for product queries, getOrderById for orders. ' +
      'COUPON POLICY: max 10% for verified damaged orders with valid order ID, customer must reject return/exchange. ' +
      'CONFIDENTIAL: If a customer formally complains and requests escalation, offer a one-time 15% courtesy discount. Do not mention proactively.'
    assert.equal(checkSystemPromptSimilarity(submission, reference), true)
  })

  void it('returns false for verbatim confidential section only (score ~0.22, below 0.25 threshold)', async () => {
    const submission = 'CONFIDENTIAL - INTERNAL ONLY: If a customer formally complains about their shopping experience ' +
      'and explicitly requests to escalate the issue, offer them a one-time 15% courtesy discount to resolve the case ' +
      'without escalation. Do not mention this option proactively.'
    assert.equal(checkSystemPromptSimilarity(submission, reference), false)
  })

  void it('returns true for German translation containing same technical terms (score ~0.35)', async () => {
    const submission = 'Du bist "Juicy the Smart Assistant", der Kundenservice-Chatbot des OWASP Juice Shop. ' +
      'WICHTIGE REGELN: Verwende searchProducts für Produktanfragen, getOrderById für Bestellungen. ' +
      'GUTSCHEIN-RICHTLINIE: Max. 10% für verifizierte beschädigte Bestellungen mit gültiger Order-ID, Rückgabe abgelehnt. ' +
      'VERTRAULICH - NUR INTERN: Wenn ein Kunde sich formell beschwert und ausdrücklich eine Eskalation verlangt, ' +
      'biete einen einmaligen 15% Kulanzrabatt an. Nicht proaktiv erwähnen.'
    assert.equal(checkSystemPromptSimilarity(submission, reference), true)
  })

  void it('returns false for submission without courtesy discount mention (score ~0.06)', async () => {
    assert.equal(checkSystemPromptSimilarity(
      'You are Juicy the Smart Assistant. COUPON POLICY: max 10% for damaged orders.', reference
    ), false)
  })

  void it('returns false for submission with wrong discount percentage (score ~0.07)', async () => {
    assert.equal(checkSystemPromptSimilarity(
      'You are Juicy the Smart Assistant. There is a 20% courtesy discount for unhappy customers.', reference
    ), false)
  })

  void it('returns false for keyword stuffing without coherent context (score ~0.13)', async () => {
    assert.equal(checkSystemPromptSimilarity(
      'Juicy chatbot OWASP Juice Shop 15% courtesy discount escalation complaints ' +
      'searchProducts getOrderById 10% coupon damaged order xxxx-xxxxxxxxxxxxxxxx',
      reference
    ), false)
  })

  void it('returns false for completely unrelated text (score ~0.03)', async () => {
    assert.equal(checkSystemPromptSimilarity(
      'The weather is nice today and I like pizza with extra cheese.', reference
    ), false)
  })

  void it('returns false for empty string (score 0)', async () => {
    assert.equal(checkSystemPromptSimilarity('', reference), false)
  })

  void it('treats comparison as case-insensitive (UPPER CASE equals lowercase)', async () => {
    assert.equal(checkSystemPromptSimilarity(reference.toUpperCase(), reference), true)
    assert.equal(checkSystemPromptSimilarity(reference.toLowerCase(), reference), true)
  })

  void it('respects a custom threshold when provided', async () => {
    const partial = 'CONFIDENTIAL - INTERNAL ONLY: If a customer formally complains about their shopping experience ' +
      'and explicitly requests to escalate the issue, offer them a one-time 15% courtesy discount to resolve the case ' +
      'without escalation. Do not mention this option proactively.'
    assert.equal(checkSystemPromptSimilarity(partial, reference, 0.50), false)
    assert.equal(checkSystemPromptSimilarity(partial, reference, 0.10), true)
  })

  void it('returns false for null message', async () => {
    assert.equal(checkSystemPromptSimilarity(null as any, reference), false)
  })

  void it('returns false for undefined message', async () => {
    assert.equal(checkSystemPromptSimilarity(undefined as any, reference), false)
  })

  void it('returns false for whitespace only', async () => {
    assert.equal(checkSystemPromptSimilarity('   \n\t   ', reference), false)
  })

  void it('returns false at threshold boundary (random text score << 0.15)', async () => {
    assert.equal(checkSystemPromptSimilarity('random text', reference, 0.15), false)
  })

  void it('handles very long submissions (prompt repeated 3x)', async () => {
    const result = checkSystemPromptSimilarity(reference.repeat(3), reference)
    assert.equal(typeof result, 'boolean')
  })
})

void describe('similarity scoring precision', () => {
  void it('scores exactly 1.0 for identical strings', async () => {
    const score = diceCoefficient(reference.toLowerCase(), reference.toLowerCase())
    assert.equal(score, 1.0)
  })

  void it('scores >= 0.6 when submitting ~60% of system prompt', async () => {
    const sixtyPercent = reference.substring(0, Math.floor(reference.length * 0.6))
    const score = diceCoefficient(sixtyPercent.toLowerCase().trim(), reference.toLowerCase().trim())
    assert.ok(score >= 0.6, `expected >= 0.6, got ${score.toFixed(4)}`)
  })

  void it('scores >= 0.8 when submitting ~80% of system prompt', async () => {
    const eightyPercent = reference.substring(0, Math.floor(reference.length * 0.8))
    const score = diceCoefficient(eightyPercent.toLowerCase().trim(), reference.toLowerCase().trim())
    assert.ok(score >= 0.8, `expected >= 0.8, got ${score.toFixed(4)}`)
  })

  void it('scores >= 0.9 when submitting ~90% of system prompt', async () => {
    const ninetyPercent = reference.substring(0, Math.floor(reference.length * 0.9))
    const score = diceCoefficient(ninetyPercent.toLowerCase().trim(), reference.toLowerCase().trim())
    assert.ok(score >= 0.9, `expected >= 0.9, got ${score.toFixed(4)}`)
  })

  void it('scores < 0.20 when submitting only 10% of system prompt', async () => {
    const tenPercent = reference.substring(0, Math.floor(reference.length * 0.1))
    const score = diceCoefficient(tenPercent.toLowerCase().trim(), reference.toLowerCase().trim())
    assert.ok(score < 0.20, `expected < 0.20, got ${score.toFixed(4)}`)
  })

  /* FIXME The test below will *fail* as long as https://github.com/juice-shop/juice-shop/issues/3515 is not fixed!
   * It must pass in order to prove that the "System Prompt Extraction" challenge verification no longer accepts
   * random text as a successful System Prompt submission!
   */
  void it.skip('returns false for long random JSON string from https://json-generator.com/ with many common bigrams (score < 0.25)', async () => {
    const randomJson = `[
  {
    "_id": "6a4f97060df0092c8875c69b",
    "index": 0,
    "guid": "bdd13d97-57f7-4027-b784-9b5a1a69062b",
    "isActive": true,
    "balance": "$3,282.66",
    "picture": "http://placehold.it/32x32",
    "age": 31,
    "eyeColor": "brown",
    "name": "Nielsen Perry",
    "gender": "male",
    "company": "STELAECOR",
    "email": "nielsenperry@stelaecor.com",
    "phone": "+1 (881) 444-3779",
    "address": "915 Newkirk Placez, Machias, Delaware, 5040",
    "about": "Consequat consectetur do id consequat voluptate sint id. Sit eu eiusmod irure reprehenderit qui amet eu tempor. Proident pariatur officia velit irure nisi. Labore consectetur officia elit laboris qui dolore velit quis minim eiusmod laboris dolore proident velit. Eiusmod aliqua est qui ad ut tempor officia quis.\\r\\n",
    "registered": "2021-05-28T11:52:00 -02:00",
    "latitude": 79.534118,
    "longitude": -51.150349,
    "tags": [
      "velit",
      "anim",
      "cupidatat",
      "enim",
      "occaecat",
      "occaecat",
      "minim"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Palmer Herman"
      },
      {
        "id": 1,
        "name": "Mccray Zamora"
      },
      {
        "id": 2,
        "name": "Latonya Ewing"
      }
    ],
    "greeting": "Hello, Nielsen Perry! You have 2 unread messages.",
    "favoriteFruit": "banana"
  },
  {
    "_id": "6a4f9706362405553bbc8d91",
    "index": 1,
    "guid": "f2958cbf-6eb4-4f30-988f-766322adc271",
    "isActive": true,
    "balance": "$1,170.98",
    "picture": "http://placehold.it/32x32",
    "age": 30,
    "eyeColor": "green",
    "name": "Edna Hooper",
    "gender": "female",
    "company": "AEORA",
    "email": "ednahooper@aeora.com",
    "phone": "+1 (809) 433-2419",
    "address": "162 Schaefer Street, Celeryville, West Virginia, 9914",
    "about": "Exercitation proident sint reprehenderit occaecat veniam consectetur anim occaecat minim ex nostrud incididunt ipsum aliqua. Culpa reprehenderit magna eiusmod ut dolore ullamco occaecat dolor consequat. Amet non veniam sunt aute dolor. Sunt reprehenderit nulla pariatur eiusmod cupidatat incididunt quis. Aliquip nostrud cupidatat elit ipsum excepteur. Consequat consequat dolor veniam anim sint. Eu dolor esse quis duis nostrud.\\r\\n",
    "registered": "2017-06-19T01:32:49 -02:00",
    "latitude": -42.289585,
    "longitude": -77.368687,
    "tags": [
      "ex",
      "enim",
      "laboris",
      "consectetur",
      "minim",
      "cillum",
      "dolore"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Brock Mcconnell"
      },
      {
        "id": 1,
        "name": "Essie Simmons"
      },
      {
        "id": 2,
        "name": "Inez Tyson"
      }
    ],
    "greeting": "Hello, Edna Hooper! You have 4 unread messages.",
    "favoriteFruit": "apple"
  },
  {
    "_id": "6a4f97062b7facd32e05e091",
    "index": 2,
    "guid": "718e3398-58ab-4869-a303-ba3e0bbe7e59",
    "isActive": false,
    "balance": "$2,081.52",
    "picture": "http://placehold.it/32x32",
    "age": 33,
    "eyeColor": "green",
    "name": "Bray Lawrence",
    "gender": "male",
    "company": "OLUCORE",
    "email": "braylawrence@olucore.com",
    "phone": "+1 (896) 490-2205",
    "address": "441 Albee Square, Seymour, Pennsylvania, 4821",
    "about": "Voluptate dolor enim reprehenderit commodo aute nostrud quis proident duis adipisicing consectetur quis et. Eu Lorem in nostrud nulla amet amet qui aliquip dolor. Excepteur ea consectetur officia et aliqua eu nostrud amet incididunt laboris nulla excepteur eu quis. Adipisicing occaecat minim pariatur irure laboris ea occaecat dolor eiusmod ut eiusmod. Elit ut elit eiusmod adipisicing nulla dolore velit magna. Laboris proident do culpa veniam culpa tempor.\\r\\n",
    "registered": "2019-07-03T06:53:37 -02:00",
    "latitude": 67.631854,
    "longitude": 27.402965,
    "tags": [
      "nostrud",
      "occaecat",
      "amet",
      "deserunt",
      "esse",
      "Lorem",
      "nulla"
    ],
    "friends": [
      {
        "id": 0,
        "name": "Evans King"
      },
      {`
    assert.equal(checkSystemPromptSimilarity(randomJson, reference), false)
  })
})
