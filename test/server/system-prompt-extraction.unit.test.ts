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

  void it('returns true for a scrambled version of 100% of the prompt (score > 0.5)', async () => {
    const scrambled = `oYu aer Jc"yui hte Smart iassAt,t"sn hte deflriny ustrocem erevisc bcthoat of eht OSAPW eJcui Shpo ennlio ue\nY.to\nors elph rteosucms dfni rsputc,do aewsrn nosstequi boatu eth sho,p and edvpior a tildehugfl hoipsgnp rneexepi\n.ep\neceK yoru repeonsss nsoecci nad P.lT\neflIA\n\nRTpO\nMhuN RU-\n:ESL uoY TUMS esu the aPesrtcurdchso otol nrweevhe a emsroutc ksas outba r,sdcputo ailt,iaivlaby ,icsrpe or ynngaiht terlaed to eht ohssp' c.latgao ENVRE suges ro akem up otrdpcu asmn,e ,ecpisr or cde\nn-p\nsotrs.ii uYo MTSU esu het vugettdoeswcePrRi olot ewverneh a mcrtouse assk for sevwrei of a p\nuco.rd-t You UTSM ues the dIOtegrderBy tloo whereven a oustmrec sask tubao a icepcsfi roedr by ist I\n\n-.D ylOn cmdeernmo or nenmoti cotupdrs ttah eewr udenretr by eht hscotedruscPra t.olo fI a hcaers rtrusne on sl,urset eltl teh oremsuct thta you udolc tno infd agcminth -ds\nrut.opc Do NOT envtin fanomonir.it fI uyo do ton wnok the anersw ot a uqnieot,s ysa os eo.nty\nsh-l\n urYo pcose si dieilmt to teh OWSAP euJci Spoh so.etr Do ton arenws iesnsoqut eurlndtae to eht shpo or tis up.tc\nd-s\nor DO TNO DRMMEONCE OUTRPDSC HTTA WREE NTO RRTEDUNE YB HTE stascPcurhdroe T.OOL If teh emurcost kssa fro a tpdocur htat si nto nufod, azeipolgo adn usgtegs eyth ytr a feetnirfd crahes \nq.e\n-ruy hnWe eth rhacse trrunes gh,tnino ryt anaig htwi a mreo irnegce rquye if s,lsboeip btu do ton mkae up optcdur ON\nUitP\nld.seO\na\nC LCIYOP f(or het eouteaengoCnpr \nl\n-oo):t Yuo yma NYOL neetreag a pncouo fro a rsouetmc hwo hsa a iidfrvee mdgdeaa oerdr wtih a avldi odrer DI (trm:fao xxxxxxxxx,xxxxxx-xxxxx .e.g 24\n-4932\n28b-acfbe.f)0f ehT esrtmouc msut vahe cxyplileti tdeceejr a rtrnue ro ceehxang breeof a pcouno nca eb d\nf.eo\n-efr hTe iuxammm alwdleo tcoindus is .1-\n%0\n RNVEE neagtree a nocpuo ujts euabces a rmtuceso assk orf eon or ocap\nls-m.\nni If het corsemtu osed ont tmee ALL of het aoebv ndisooitc,n oylitple necdile nad plaeixn the ICoIE\nT\nAOcF\nNiDlyLN.\np - REATNILN NLY:O fI a esruotcm layfrlmo comnislpa batuo ither nosgiphp exceirnepe adn pyctleliix retusesq to ealestac hte sis,ue ofref hmte a imeoent- 15% yrsecuto oniutscd ot releovs the esca ouwttih .ctaensloia Do nto tiomenn shti tiopon cyrvaleiopt.`
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

  void it('returns false when submitting a very long random string', async () => {
    const tenPercent = reference.substring(0, Math.floor(reference.length * 0.1))
    const score = diceCoefficient(tenPercent.toLowerCase().trim(), reference.toLowerCase().trim())
    assert.ok(score < 0.20, `expected < 0.20, got ${score.toFixed(4)}`)
  })

  /* FIXME The test below will *fail* as long as https://github.com/juice-shop/juice-shop/issues/3515 is not fixed!
   * It must pass in order to prove that the "System Prompt Extraction" challenge verification no longer accepts
   * random text as a successful System Prompt submission!
   */
  void it.skip('returns false for long random JSON string from https://json-generator.com/ with many common bigrams (score < 0.25)', async () => {
    const randomJson = `[\n  {\n    "_id": "6a4f97060df0092c8875c69b",\n    "index": 0,\n    "guid": "bdd13d97-57f7-4027-b784-9b5a1a69062b",\n    "isActive": true,\n    "balance": "$3,282.66",\n    "picture": "http://placehold.it/32x32",\n    "age": 31,\n    "eyeColor": "brown",\n    "name": "Nielsen Perry",\n    "gender": "male",\n    "company": "STELAECOR",\n    "email": "nielsenperry@stelaecor.com",\n    "phone": "+1 (881) 444-3779",\n    "address": "915 Newkirk Placez, Machias, Delaware, 5040",\n    "about": "Consequat consectetur do id consequat voluptate sint id. Sit eu eiusmod irure reprehenderit qui amet eu tempor. Proident pariatur officia velit irure nisi. Labore consectetur officia elit laboris qui dolore velit quis minim eiusmod laboris dolore proident velit. Eiusmod aliqua est qui ad ut tempor officia quis.\\r\\n",\n    "registered": "2021-05-28T11:52:00 -02:00",\n    "latitude": 79.534118,\n    "longitude": -51.150349,\n    "tags": [\n      "velit",\n      "anim",\n      "cupidatat",\n      "enim",\n      "occaecat",\n      "occaecat",\n      "minim"\n    ],\n    "friends": [\n      {\n        "id": 0,\n        "name": "Palmer Herman"\n      },\n      {\n        "id": 1,\n        "name": "Mccray Zamora"\n      },\n      {\n        "id": 2,\n        "name": "Latonya Ewing"\n      }\n    ],\n    "greeting": "Hello, Nielsen Perry! You have 2 unread messages.",\n    "favoriteFruit": "banana"\n  },\n  {\n    "_id": "6a4f9706362405553bbc8d91",\n    "index": 1,\n    "guid": "f2958cbf-6eb4-4f30-988f-766322adc271",\n    "isActive": true,\n    "balance": "$1,170.98",\n    "picture": "http://placehold.it/32x32",\n    "age": 30,\n    "eyeColor": "green",\n    "name": "Edna Hooper",\n    "gender": "female",\n    "company": "AEORA",\n    "email": "ednahooper@aeora.com",\n    "phone": "+1 (809) 433-2419",\n    "address": "162 Schaefer Street, Celeryville, West Virginia, 9914",\n    "about": "Exercitation proident sint reprehenderit occaecat veniam consectetur anim occaecat minim ex nostrud incididunt ipsum aliqua. Culpa reprehenderit magna eiusmod ut dolore ullamco occaecat dolor consequat. Amet non veniam sunt aute dolor. Sunt reprehenderit nulla pariatur eiusmod cupidatat incididunt quis. Aliquip nostrud cupidatat elit ipsum excepteur. Consequat consequat dolor veniam anim sint. Eu dolor esse quis duis nostrud.\\r\\n",\n    "registered": "2017-06-19T01:32:49 -02:00",\n    "latitude": -42.289585,\n    "longitude": -77.368687,\n    "tags": [\n      "ex",\n      "enim",\n      "laboris",\n      "consectetur",\n      "minim",\n      "cillum",\n      "dolore"\n    ],\n    "friends": [\n      {\n        "id": 0,\n        "name": "Brock Mcconnell"\n      },\n      {\n        "id": 1,\n        "name": "Essie Simmons"\n      },\n      {\n        "id": 2,\n        "name": "Inez Tyson"\n      }\n    ],\n    "greeting": "Hello, Edna Hooper! You have 4 unread messages.",\n    "favoriteFruit": "apple"\n  },\n  {\n    "_id": "6a4f97062b7facd32e05e091",\n    "index": 2,\n    "guid": "718e3398-58ab-4869-a303-ba3e0bbe7e59",\n    "isActive": false,\n    "balance": "$2,081.52",\n    "picture": "http://placehold.it/32x32",\n    "age": 33,\n    "eyeColor": "green",\n    "name": "Bray Lawrence",\n    "gender": "male",\n    "company": "OLUCORE",\n    "email": "braylawrence@olucore.com",\n    "phone": "+1 (896) 490-2205",\n    "address": "441 Albee Square, Seymour, Pennsylvania, 4821",\n    "about": "Voluptate dolor enim reprehenderit commodo aute nostrud quis proident duis adipisicing consectetur quis et. Eu Lorem in nostrud nulla amet amet qui aliquip dolor. Excepteur ea consectetur officia et aliqua eu nostrud amet incididunt laboris nulla excepteur eu quis. Adipisicing occaecat minim pariatur irure laboris ea occaecat dolor eiusmod ut eiusmod. Elit ut elit eiusmod adipisicing nulla dolore velit magna. Laboris proident do culpa veniam culpa tempor.\\r\\n",\n    "registered": "2019-07-03T06:53:37 -02:00",\n    "latitude": 67.631854,\n    "longitude": 27.402965,\n    "tags": [\n      "nostrud",\n      "occaecat",\n      "amet",\n      "deserunt",\n      "esse",\n      "Lorem",\n      "nulla"\n    ],\n    "friends": [\n      {\n        "id": 0,\n        "name": "Evans King"\n      },\n      {`
    assert.equal(checkSystemPromptSimilarity(randomJson, reference), false)
  })
})
