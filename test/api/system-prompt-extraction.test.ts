/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { checkSystemPromptSimilarity, diceCoefficient, SYSTEM_PROMPT_SIMILARITY_THRESHOLD } from '../../routes/verify'
import { buildSystemPrompt } from '../../routes/chat'

const reference = buildSystemPrompt()

let keepAlive: NodeJS.Timeout
before(async () => { keepAlive = setTimeout(() => {}, 60000) })
after(async () => { clearTimeout(keepAlive) })

void describe('checkSystemPromptSimilarity', () => {
  void it('returns true for verbatim system prompt (score ~1.0)', async () => {
    assert.equal(checkSystemPromptSimilarity(reference, reference), true)
  })

  void it('returns true for near-verbatim submission with minor rewording (score > 0.20)', async () => {
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

  void it('threshold constant equals 0.25', async () => {
    assert.equal(SYSTEM_PROMPT_SIMILARITY_THRESHOLD, 0.25)
  })
})
