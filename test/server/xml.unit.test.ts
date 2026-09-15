/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseXmlString } from '../../lib/xml'

void describe('xml', () => {
  void it('should parse a simple XML string', async () => {
    const xml = '<?xml version="1.0" encoding="UTF-8"?><root>hello</root>'
    const result = await parseXmlString(xml)
    assert.match(result, /<root>hello<\/root>/)
  })

  void it('should expand internal entities', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE root [
  <!ENTITY hello "world">
]>
<root>&hello;</root>`
    const result = await parseXmlString(xml)
    assert.match(result, /<root>world<\/root>/)
  })

  void it('should throw error on malformed XML', async () => {
    const xml = '<root>unclosed'
    await assert.rejects(async () => {
      await parseXmlString(xml)
    })
  })

  void it('should timeout on entity expansion bomb', async () => {
    const xml = `<?xml version="1.0"?>
<!DOCTYPE lolz [
 <!ENTITY lol "lol">
 <!ELEMENT lolz (#PCDATA)>
 <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
 <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
 <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
 <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
 <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
 <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
 <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
 <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
 <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<lolz>&lol9;</lolz>`
    // This might trigger either the libxml2 amplification protection or the VM timeout
    await assert.rejects(async () => {
      await parseXmlString(xml, 100) // 100ms timeout
    }, /(Script execution timed out|Maximum entity amplification factor exceeded)/)
  })
})
