/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const challenges = require('../data/datacache').challenges
const path = require('path')
const fs = require('graceful-fs')
fs.gracefulify(require('fs'))

const cache = {}

const fileSniff = async (paths, match) => {
  const matches = []
  for (const currPath of paths) {
    if (fs.lstatSync(currPath).isDirectory()) {
      const files = fs.readdirSync(currPath)
      for (const file of files) paths.push(path.resolve(currPath, file))
    } else {
      const data = fs.readFileSync(currPath)
      const code = data.toString()
      const lines = code.split('\n')
      for (const line of lines) {
        if (match.test(line)) {
          matches.push({
            path: currPath,
            match: line
          })
        }
      }
    }
  }

  return matches
}

exports.serveCodeSnippet = () => async (req, res, next) => {
  const challenge = challenges[req.params.challenge]
  if (challenge) {
    if (cache[challenge.key]) {
      return res.json(cache[challenge.key])
    } else {
      const paths = ['./server.ts', './routes', './lib', './data', './frontend/src/app']
      const match = new RegExp(`vuln-code-snippet start.*${challenge.key}`)
      const matches = await fileSniff(paths, match)
      if (matches[0]) { // TODO Currently only a single source file is supported
        const source = fs.readFileSync(path.resolve(matches[0].path), 'utf8')
        const snippets = source.match(`[/#]{0,2} vuln-code-snippet start.*${challenge.key}([^])*vuln-code-snippet end.*${challenge.key}`)
        if (snippets != null) {
          let snippet = snippets[0] // TODO Currently only a single code snippet is supported
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
            if (new RegExp(`vuln-code-snippet vuln-line.*${challenge.key}`).exec(lines[i]) != null) {
              vulnLines.push(i + 1)
            }
          }
          snippet = snippet.replace(/[/#]{0,2} vuln-code-snippet vuln-line.*/g, '')
          cache[challenge.key] = { snippet, vulnLines }
          return res.json({ snippet, vulnLines })
        } else {
          res.status(422).json({ status: 'error', error: 'Broken code snippet boundaries for: ' + challenge.key })
        }
      } else {
        res.status(404).json({ status: 'error', error: 'No code snippet available for: ' + challenge.key })
      }
    }
  } else {
    res.status(412).json({ status: 'error', error: 'Unknown challenge key: ' + req.params.challenge })
  }
}

exports.challengesWithCodeSnippet = () => async (req, res, next) => {
  const match = /vuln-code-snippet start .*/
  const paths = ['./server.ts', './routes', './lib', './data', './frontend/src/app']
  const matches = await fileSniff(paths, match)
  const challenges = matches.map(m => m.match.trim().substr(26).trim()).join(' ').split(' ')
  res.json({ challenges })
}
