/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const challenges = require('../data/datacache').challenges

module.exports = function serveCodeSnippet () {
  return (req, res, next) => {
    const challenge = challenges[req.params.challenge]
    if (challenge) {
      // TODO Parse code base for code snippet wrapped in "vuln-code-snippet start [challengeKey, otherChallengeKey, ...]" and "vuln-code-snippet end"
      const snippet = false
      if (snippet) {
        // TODO Remove all lines from snippet containing function call to "utils.solve" or "utils.solveIf"
        // TODO Additionally remove all lines from snippet with line comment "// vuln-code-snippet hide-line"
        // TODO Augment response with line number(s) of vulnerable line(s) marked with "vuln-code-snippet vuln-line" for highlighting in frontend
        // TODO Remove all leftover code comments starting with "vuln-code-snippet" from snippet (might occur when  different start-end blocks overlap)
        return res.json({ challenge }) // TODO Return code snippet instead
      } else {
        res.status(404).json({ status: 'error', error: 'No code snippet available for: ' + req.params.challenge })
      }
    } else {
      res.status(412).json({ status: 'error', error: 'Unknown challenge key: ' + req.params.challenge })
    }
  }
}
