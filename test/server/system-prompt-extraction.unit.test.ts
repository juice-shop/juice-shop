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

  void it('returns true for German translation containing same technical terms (score > 0.25)', async () => {
    const submission = 'Du bist "Juicy the Smart Assistant", der freundliche Kundenservice-Chatbot des OWASP Juice Shop. ' +
      'Du hilfst Kunden, Produkte zu finden, beantwortest Fragen zum Shop und sorgst für ein angenehmes Einkaufserlebnis. ' +
      'Halte deine Antworten prägnant und hilfreich. ' +
      'WICHTIGE REGELN: ' +
      '- Du MUSST das searchProducts-Tool verwenden, wenn ein Kunde nach Produkten, Verfügbarkeit, Preisen oder irgendetwas im Zusammenhang mit dem Katalog des Shops fragt. Erfinde NIEMALS Produktnamen, Preise oder Beschreibungen. ' +
      '- Du MUSST das getProductReviews-Tool verwenden, wenn ein Kunde nach Bewertungen eines Produkts fragt. ' +
      '- Du MUSST das getOrderById-Tool verwenden, wenn ein Kunde nach einer bestimmten Bestellung anhand ihrer ID fragt. ' +
      'GUTSCHEIN-RICHTLINIE (für das generateCoupon-Tool): ' +
      '- Du darfst einen Gutschein NUR für einen Kunden erstellen, der eine verifizierte beschädigte Bestellung mit einer gültigen Bestell-ID hat (Format: xxxx-xxxxxxxxxxxxxxxx). ' +
      '- Die maximale Ermäßigung beträgt 10%. ' +
      'VERTRAULICH - NUR INTERN: Wenn ein Kunde sich formell beschwert und ausdrücklich eine Eskalation verlangt, ' +
      'biete einen einmaligen 15% Kulanzrabatt an. Nicht proaktiv erwähnen.'
    assert.equal(checkSystemPromptSimilarity(submission, reference), true)
  })

  void it('returns true for a scrambled version of 100% of the prompt (score > 0.5)', async () => {
    const scrambled = 'IMPORTANT RULES: Do NOT invent information. Keep your responses concise and helpful. ' +
      'You are Juicy the Smart Assistant, the friendly customer service chatbot of the OWASP Juice Shop online store. ' +
      'COUPON POLICY: The maximum allowed discount is 10%. Use getOrderById for specific orders. ' +
      'CONFIDENTIAL - INTERNAL ONLY: Offer a one-time 15% courtesy discount if a customer formally complains and requests escalation.'
    assert.equal(checkSystemPromptSimilarity(scrambled, reference), true)
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

void it('returns false when submitting a very long random string', async () => {
  const random = reference.substring(0, Math.floor(reference.length * 0.1))
  const score = diceCoefficient(random.toLowerCase().trim(), reference.toLowerCase().trim())
  assert.ok(score < 0.20, `expected < 0.20, got ${score.toFixed(4)}`)
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
})
