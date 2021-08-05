import { Request, Response, NextFunction } from 'express'
const fs = require('fs')

const FixesDir = 'data/static/codefixes'

interface codeFix {
  fixes: string[]
  correct: number
}

interface cache {
  [index: string]: codeFix
}

const CodeFixes: cache = {}

const shuffle = (key: string) => {
  const fixes = CodeFixes[key].fixes
  let correct = CodeFixes[key].correct
  let randomRotation = Math.random() * 100
  while (randomRotation > 0) {
    const end = fixes[fixes.length - 1]
    for (let i = fixes.length - 1; i > 0; i--) {
      fixes[i] = fixes[i - 1]
    }
    fixes[0] = end
    correct = (correct + 1) % (fixes.length)
    randomRotation--
  }

  CodeFixes[key].correct = correct
  CodeFixes[key].fixes = fixes
}

const readFixes = (key: string, toShuffle: boolean) => {
  if (CodeFixes[key]) {
    if (toShuffle) shuffle(key)
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

  if (toShuffle) shuffle(key)
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
  const fixData = readFixes(key, true)
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

export const checkCorrectFix = () => (req: Request<{}, {}, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const key = req.body.key
  const selectedFix = req.body.selectedFix - 1
  const fixData = readFixes(key, false)
  if (fixData.fixes.length === 0) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }

  if (selectedFix === fixData.correct) {
    res.status(200).json({
      verdict: true
    })
  } else {
    res.status(200).json({
      verdict: false
    })
  }
}
