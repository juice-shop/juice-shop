/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type NextFunction, type Request, type Response } from 'express'
import yaml from 'js-yaml'
import fs from 'node:fs'

import { getCodeChallenges } from '../lib/codingChallenges'
import * as challengeUtils from '../lib/challengeUtils'
import * as accuracy from '../lib/accuracy'
import * as utils from '../lib/utils'
import { type ChallengeKey } from 'models/challenge'

interface SnippetRequestBody {
  challenge: string
}

interface VerdictRequestBody {
  selectedLines: number[]
  key: ChallengeKey
}

const setStatusCode = (error: any) => {
  switch (error.name) {
    case 'BrokenBoundary':
      return 422
    default:
      return 200
  }
}

export const retrieveCodeSnippet = async (challengeKey: string) => {
  const codeChallenges = await getCodeChallenges()
  if (codeChallenges.has(challengeKey)) {
    return codeChallenges.get(challengeKey) ?? null
  }
  return null
}

export const serveCodeSnippet = () => async (req: Request<SnippetRequestBody, Record<string, unknown>, Record<string, unknown>>, res: Response, next: NextFunction) => {
  try {
    const snippetData = await retrieveCodeSnippet(req.params.challenge)
    if (snippetData == null) {
      res.status(404).json({ status: 'error', error: `No code challenge for challenge key: ${req.params.challenge}` })
      return
    }
    res.status(200).json({ snippet: snippetData.snippet })
  } catch (error) {
    const statusCode = setStatusCode(error)
    res.status(statusCode).json({ status: 'error', error: utils.getErrorMessage(error) })
  }
}

export const retrieveChallengesWithCodeSnippet = async () => {
  const codeChallenges = await getCodeChallenges()
  return [...codeChallenges.keys()]
}

export const getVerdict = (vulnLines: number[], neutralLines: number[], selectedLines: number[]) => {
  if (selectedLines === undefined) return false
  if (vulnLines.length > selectedLines.length) return false
  if (!vulnLines.every(e => selectedLines.includes(e))) return false
  const okLines = [...vulnLines, ...neutralLines]
  const notOkLines = selectedLines.filter(x => !okLines.includes(x))
  return notOkLines.length === 0
}

export const checkVulnLines = () => async (req: Request<Record<string, unknown>, Record<string, unknown>, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const key = req.body.key
  let snippetData
  try {
    snippetData = await retrieveCodeSnippet(key)
    if (snippetData == null) {
      res.status(404).json({ status: 'error', error: `No code challenge for challenge key: ${key}` })
      return
    }
  } catch (error) {
    const statusCode = setStatusCode(error)
    res.status(statusCode).json({ status: 'error', error: utils.getErrorMessage(error) })
    return
  }
  const vulnLines: number[] = snippetData.vulnLines
  const neutralLines: number[] = snippetData.neutralLines
  const selectedLines: number[] = req.body.selectedLines
  const verdict = getVerdict(vulnLines, neutralLines, selectedLines)
  let hint
  if (fs.existsSync('./data/static/codefixes/' + key + '.info.yml')) {
    const codingChallengeInfos = yaml.load(fs.readFileSync('./data/static/codefixes/' + key + '.info.yml', 'utf8'))
    if (codingChallengeInfos?.hints) {
      if (accuracy.getFindItAttempts(key) > codingChallengeInfos.hints.length) {
        if (vulnLines.length === 1) {
          hint = res.__('Line {{vulnLine}} is responsible for this vulnerability or security flaw. Select it and submit to proceed.', { vulnLine: vulnLines[0].toString() })
        } else {
          hint = res.__('Lines {{vulnLines}} are responsible for this vulnerability or security flaw. Select them and submit to proceed.', { vulnLines: vulnLines.toString() })
        }
      } else {
        const nextHint = codingChallengeInfos.hints[accuracy.getFindItAttempts(key) - 1] // -1 prevents after first attempt
        if (nextHint) hint = res.__(nextHint)
      }
    }
  }
  if (verdict) {
    await challengeUtils.solveFindIt(key)
    res.status(200).json({
      verdict: true
    })
  } else {
    accuracy.storeFindItVerdict(key, false)
    res.status(200).json({
      verdict: false,
      hint
    })
  }
}
