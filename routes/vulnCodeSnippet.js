/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const challenges = require('../data/datacache').challenges
const fs = require('fs')

module.exports = function serveCodeSnippet () {
  return (req, res, next) => {
    const challenge = challenges[req.params.challenge]
    if (challenge) {
      const source = fs.readFileSync('routes/login.js', 'utf8') // TODO Instead find file(s) containing "vuln-code-snippet start [challengeKey, otherChallengeKey, ...]"
      let snippet = source.match(`// vuln-code-snippet start [.*${challenge}.*](.|\\r\\n)*vuln-code-snippet end [.*${challenge}.*]`)
      if (snippet) {
        snippet = snippet[0]

        const lines = snippet.split('\r\n')
        let vulnLine
        for (let i = 0; i < lines.length; i++) {
          if (/vuln-code-snippet vuln-line/.exec(lines[i])) {
            vulnLine = i
            break
          }
        }

        snippet = snippet.replace(/.*\/\/ vuln-code-snippet hide-lin1e/g, '')
        snippet = snippet.replace(/\/\/ vuln-code-snippet .*/g, '')
        snippet = snippet.trim()

        return res.json({ snippet, vulnLine })
      } else {
        res.status(404).json({ status: 'error', error: 'No code snippet available for: ' + req.params.challenge })
      }
    } else {
      res.status(412).json({ status: 'error', error: 'Unknown challenge key: ' + req.params.challenge })
    }
  }
}
