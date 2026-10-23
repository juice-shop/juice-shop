/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode, AllHtmlEntities } from '../../lib/htmlEntities'

void describe('htmlEntities', () => {
  void describe('encode', () => {
    void it('should encode HTML special characters', () => {
      assert.equal(encode('<script>alert("xss & \'injection\'")</script>'), '&lt;script&gt;alert(&quot;xss &amp; &#39;injection&#39;&quot;)&lt;/script&gt;')
    })

    void it('should handle empty or falsy inputs', () => {
      assert.equal(encode(''), '')
      assert.equal(encode(null as any), '')
    })
  })

  void describe('decode', () => {
    void it('should decode named entities', () => {
      assert.equal(decode('&lt;b&gt;bold &amp; &quot;quoted&quot;&lt;/b&gt;'), '<b>bold & "quoted"</b>')
    })

    void it('should decode decimal numeric entities', () => {
      assert.equal(decode('&#60;&#98;&#62;&#65;&#38;&#66;&#60;&#47;&#98;&#62;'), '<b>A&B</b>')
    })

    void it('should decode hexadecimal numeric entities', () => {
      assert.equal(decode('&#x3c;&#x62;&#x3e;&#x41;&#x26;&#x42;&#x3c;&#x2f;&#x62;&#x3e;'), '<b>A&B</b>')
    })

    void it('should handle empty or falsy inputs', () => {
      assert.equal(decode(''), '')
      assert.equal(decode(null as any), '')
    })
  })

  void describe('AllHtmlEntities class compatibility', () => {
    void it('should provide encode and decode methods', () => {
      const entities = new AllHtmlEntities()
      assert.equal(entities.encode('<h1>Title & Subtitle</h1>'), '&lt;h1&gt;Title &amp; Subtitle&lt;/h1&gt;')
      assert.equal(entities.decode('&lt;h1&gt;Title &amp; Subtitle&lt;/h1&gt;'), '<h1>Title & Subtitle</h1>')
    })
  })
})
