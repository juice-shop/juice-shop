/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const challenges = require('../data/datacache').challenges
const path = require('path')
import fs = require('fs')
const { FileSniffer, asArray } = require('filesniffer')

exports.serveCodeSnippet = () => async (req, res, next) => {
  const challenge = challenges[req.params.challenge]
  if (challenge) {
    const matches = await FileSniffer
      .create()
      .path('./server.ts')
      .path('./routes')
      .path('./lib')
      .path('./data')
      .path('./frontend/src/app')
      .depth(1)
      .collect(asArray())
      .find(new RegExp(`vuln-code-snippet start.*${challenge.key}`))
    if (matches[0]) { // TODO Currently only a single source file is supported
      const source = fs.readFileSync(path.resolve(matches[0].path), 'utf8')
      let snippet = source.match(`[/#]{0,2} vuln-code-snippet start.*${challenge.key}([^])*vuln-code-snippet end.*${challenge.key}`)
      if (snippet) {
        snippet = snippet[0] // TODO Currently only a single code snippet is supported
        snippet = snippet.replace(/[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}/g, '')
        snippet = snippet.replace(/[/#]{0,2} vuln-code-snippet end.*/g, '')
        snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}/g, '')
        snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-start([^])*[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}/g, '')
        snippet = snippet.trim()

        let lines = snippet.split('\r\n')
        if (lines.length === 1) lines = snippet.split('\n')
        if (lines.length === 1) lines = snippet.split('\r')
        const vulnLines = []
        for (let i = 0; i < lines.length; i++) {
          if (new RegExp(`vuln-code-snippet vuln-line.*${challenge.key}`).exec(lines[i])) {
            vulnLines.push(i + 1)
          }
        }
        snippet = snippet.replace(/[/#]{0,2} vuln-code-snippet vuln-line.*/g, '')

        return res.json({ snippet, vulnLines })
      } else {
        res.status(422).json({ status: 'error', error: 'Broken code snippet boundaries for: ' + challenge.key })
      }
    } else {
      res.status(404).json({ status: 'error', error: 'No code snippet available for: ' + challenge.key })
    }
  } else {
    res.status(412).json({ status: 'error', error: 'Unknown challenge key: ' + req.params.challenge })
  }
}

exports.challengesWithCodeSnippet = () => async (req, res, next) => {
  const matches = await FileSniffer
    .create()
    .path('./server.ts')
    .path('./routes')
    .path('./lib')
    .path('./data')
    .path('./frontend/src/app')
    .depth(1)
    .collect(asArray())
    .find(/vuln-code-snippet start .*/)
  const challenges = matches.map(m => m.match.trim().substr(26).trim()).join(' ').split(' ')
  res.json({ challenges })
}
