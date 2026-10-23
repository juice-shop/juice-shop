/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { renderRobotsTxt, robotsTxt } from '../../lib/robotsTxt'

void describe('robotsTxt', () => {
  void describe('renderRobotsTxt', () => {
    void it('should render standard UserAgent and Disallow directives', () => {
      const output = renderRobotsTxt({ UserAgent: '*', Disallow: '/ftp' })
      assert.equal(output, 'User-agent: *\nDisallow: /ftp')
    })

    void it('should render arrays of UserAgent and Disallow directives', () => {
      const output = renderRobotsTxt({ UserAgent: ['Googlebot', 'Bingbot'], Disallow: ['/ftp', '/admin'] })
      assert.equal(output, 'User-agent: Googlebot\nUser-agent: Bingbot\nDisallow: /ftp\nDisallow: /admin')
    })

    void it('should render Sitemap and Host directives', () => {
      const output = renderRobotsTxt({ UserAgent: '*', Disallow: '/ftp', Sitemap: 'https://example.com/sitemap.xml', Host: 'example.com' })
      assert.ok(output.includes('Sitemap: https://example.com/sitemap.xml'))
      assert.ok(output.includes('Host: example.com'))
    })

    void it('should return empty string when no config is provided', () => {
      assert.equal(renderRobotsTxt(), '')
    })
  })

  void describe('middleware', () => {
    void it('should return an Express router', () => {
      const router = robotsTxt({ UserAgent: '*', Disallow: '/ftp' })
      assert.ok(router)
      assert.equal(typeof router, 'function')
    })
  })
})
