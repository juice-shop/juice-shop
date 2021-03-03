/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const challenges = require('../data/datacache').challenges
const fs = require('fs')
const { FileSniffer, asArray } = require('filesniffer')

module.exports = function serveCodeSnippet () {
  return async (req, res, next) => {
    const challenge = challenges[req.params.challenge]
    if (challenge) {
      const matches = await FileSniffer
        .create()
        .path('.')
        .collect(asArray())
        .find(new RegExp(`vuln-code-snippet start.*${challenge.key}`))
      if (matches[0]) { // TODO Currently only a single source file is supported
        const source = fs.readFileSync(matches[0].path, 'utf8')
        let snippet = source.match(`// vuln-code-snippet start.*${challenge.key}(.|\\r\\n|\\n|\\r)*vuln-code-snippet end.*${challenge.key}`)
        if (snippet) {
          snippet = snippet[0] // TODO Currently only a single code snippet is supported
          snippet = snippet.replace(/\/\/ vuln-code-snippet start.*/g, '')
          snippet = snippet.replace(/\/\/ vuln-code-snippet end.*/g, '')
          snippet = snippet.replace(/.*\/\/ vuln-code-snippet hide-line/g, '')
          snippet = snippet.replace(/.*\/\/ vuln-code-snippet hide-start(.|\r\n|\n|\r)*\/\/ vuln-code-snippet hide-end/g, '')
          snippet = snippet.trim()

          let lines = snippet.split('\r\n')
          if (lines.length === 1) lines = snippet.split('\n')
          if (lines.length === 1) lines = snippet.split('\r')
          let vulnLine
          for (let i = 0; i < lines.length; i++) {
            if (new RegExp(`vuln-code-snippet vuln-line.*${challenge.key}`).exec(lines[i])) {
              vulnLine = i + 1 // TODO Currently only a single vulnerable code line is supported
              break
            }
          }
          snippet = snippet.replace(/\/\/ vuln-code-snippet vuln-line.*/g, '')

          return res.json({ snippet, vulnLine })
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
}
