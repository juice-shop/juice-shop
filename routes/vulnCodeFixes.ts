import { NextFunction, Request, Response } from 'express'

const accuracy = require('../lib/accuracy')
const utils = require('../lib/utils')
const fs = require('fs')
const yaml = require('js-yaml')

const FixesDir = 'data/static/codefixes'

interface codeFix {
  fixes: string[]
  correct: number
}

interface cache {
  [index: string]: codeFix
}

const CodeFixes: cache = {}

export const readFixes = (key: string) => {
  if (CodeFixes[key]) {
    return CodeFixes[key]
  }
  const files = fs.readdirSync(FixesDir)
  const fixes: string[] = []
  let correct: number = -1
  for (const file of files) {
    if (file.startsWith(`${key}_`)) {
      const fix = fs.readFileSync(`${FixesDir}/${file}`).toString()
      const metadata = file.split('_')
      const number = metadata[1]
      fixes.push(fix)
      if (metadata.length === 3) {
        correct = parseInt(number, 10)
        correct--
      }
    }
  }

  CodeFixes[key] = {
    fixes: fixes,
    correct: correct
  }
  return CodeFixes[key]
}

interface FixesRequestParams {
  key: string
}

interface VerdictRequestBody {
  key: string
  selectedFix: number
}

export const serveCodeFixes = () => (req: Request<FixesRequestParams, {}, {}>, res: Response, next: NextFunction) => {
  const key = req.params.key
  const fixData = readFixes(key)
  if (fixData.fixes.length === 0) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }
  res.status(200).json({
    fixes: fixData.fixes
  })
}

export const checkCorrectFix = () => async (req: Request<{}, {}, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const key = req.body.key
  const selectedFix = req.body.selectedFix
  const fixData = readFixes(key)
  if (fixData.fixes.length === 0) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
  } else {
    let explanation
    if (fs.existsSync('./data/static/codefixes/' + key + '.info.yml')) {
      const codingChallengeInfos = yaml.load(fs.readFileSync('./data/static/codefixes/' + key + '.info.yml', 'utf8'))
      const selectedFixInfo = codingChallengeInfos?.fixes.find(({ id }: { id: number }) => id === selectedFix + 1)
      if (selectedFixInfo?.explanation) explanation = res.__(selectedFixInfo.explanation)
    }
    if (selectedFix === fixData.correct) {
      await utils.solveFixIt(key)
      res.status(200).json({
        verdict: true,
        explanation
      })
    } else {
      accuracy.storeFixItVerdict(key, false)
      res.status(200).json({
        verdict: false,
        explanation
      })
    }
  }
}
