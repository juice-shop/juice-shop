/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const FETCH_OPTIONS = {
  headers: {
    'User-Agent': BROWSER_USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://www.google.com/',
    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  }
}

void describe('Required Internet resource', () => {
  void describe('PasteBin paste for "Leaked Unsafe Product" challenge available', () => {
    void it('for default configuration (https://pastebin.com/90dUgd7s)', async () => {
      const res = await fetch('https://pastebin.com/90dUgd7s', FETCH_OPTIONS)
      const body = await res.text()
      assert.equal(res.status, 200)
      assert.ok(body.includes('Hueteroneel'))
      assert.ok(body.includes('this coupled with Eurogium Edule was sometimes found fatal'))
    })

    void it('for 7MS configuration (https://pastebin.com/8SMbWPxc)', async () => {
      const res = await fetch('https://pastebin.com/8SMbWPxc', FETCH_OPTIONS)
      const body = await res.text()
      assert.equal(res.status, 200)
      assert.ok(body.includes('TAYLOR SWIFT'))
      assert.ok(body.includes('KATY PERRY'))
      assert.ok(body.includes('(Consider rivalries when picking song list for events as wrong combo could infuriate a mixed-fans audience, see https://www.nickiswift.com/2075/taylor-swifts-list-enemies)'))
    })

    void it('for BodgeIt Store configuration (https://pastebin.com/G47LrDr0)', async () => {
      const res = await fetch('https://pastebin.com/G47LrDr0', FETCH_OPTIONS)
      const body = await res.text()
      assert.equal(res.status, 200)
      assert.ok(body.includes('Mind Blank - one willing creature you touch is immune any effect'))
      assert.ok(body.includes('They should seek out a Couatl, and undertake a quest to receive'))
      assert.ok(body.includes('They could acquire the aid of a rakshasa, and willingly invoke its'))
      assert.ok(body.includes('Note to self: Option (1) and (3) of the above should not be combined.'))
    })

    void it('for Mozilla configuration (https://pastebin.com/t8jqE1y7)', async () => {
      const res = await fetch('https://pastebin.com/t8jqE1y7', FETCH_OPTIONS)
      const body = await res.text()
      assert.equal(res.status, 200)
      assert.ok(body.includes('Fixed a bug that, when this plugin was installed together with both the'))
      assert.ok(body.includes('JuiceNote'))
      assert.ok(body.includes('Magische Firefox Suche'))
      assert.ok(body.includes('plugins, lwt your browser throw a'))
      assert.ok(body.includes('JuiceOverFlowError'))
      assert.ok(body.includes('The problem can still occur post-fix but at least now less frequently!'))
    })

    void it('for All Day DevOps configuration (https://pastebin.com/RXrihEMS)', async () => {
      const res = await fetch('https://pastebin.com/RXrihEMS', FETCH_OPTIONS)
      const body = await res.text()
      assert.equal(res.status, 200)
      assert.ok(body.includes('The infamous 301 and 303 lasers.'))
      assert.ok(body.includes('Cheap Chinese crap with no quality control'))
      assert.ok(body.includes('permanent damage before you can blink your eye'))
    })
  })

  void it('Comment on "Top 10 Fruits you probably dont know" blog post with PasteBin paste URL spoiler available', async () => {
    const res = await fetch('https://listverse.disqus.com/top_20_fruits_you_probably_don039t_know/latest.rss', FETCH_OPTIONS)
    const body = await res.text()
    assert.equal(res.status, 200)
    assert.ok(body.includes('Rippertuer Special Juice'))
    assert.ok(body.includes('https://pastebin.com/90dUgd7s'))
  })

  void it('PasteBin paste (https://pastebin.com/4U1V1UjU) for "Leaked Access Logs" challenge available', async () => {
    const res = await fetch('https://pastebin.com/4U1V1UjU', FETCH_OPTIONS)
    const body = await res.text()
    assert.equal(res.status, 200)
    assert.ok(body.includes('current=0Y8rMnww$*9VFYE%C2%A759-!Fg1L6t&amp;6lB'))
  })

  void it('StackOverflow question "Less verbose access logs using expressjs/morgan" with log snippet and PasteBin paste URL spoiler available', async () => {
    const res = await fetch('https://stackoverflow.com/questions/57061271/less-verbose-access-logs-using-expressjs-morgan', FETCH_OPTIONS)
    const body = await res.text()
    assert.equal(res.status, 200)
    assert.ok(body.includes('/rest/continue-code'))
    assert.ok(body.includes('/api/Challenges/?name=Score%20Board'))
    assert.ok(body.includes('https://pastebin.com/4U1V1UjU'))
  })

  void it('GitHub issue (https://github.com/apostrophecms/sanitize-html/issues/29) for "Server-side XSS Protection" challenge available', async () => {
    const res = await fetch('https://github.com/apostrophecms/sanitize-html/issues/29', FETCH_OPTIONS)
    const body = await res.text()
    assert.equal(res.status, 200)
    assert.ok(body.includes('Sanitization is not applied recursively'))
    assert.ok(body.includes('I am not harmless: &lt;&lt;img src=&quot;csrf-attack&quot;/&gt;img src=&quot;csrf-attack&quot;/&gt; is sanitized to I am not harmless: &lt;img src=&quot;csrf-attack&quot;/&gt;'))
  })
})
