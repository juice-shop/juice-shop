import { Request, Response, NextFunction } from 'express'
const yaml = require('js-yaml')
const fs = require('fs')
const codeFixes = yaml.load(fs.readFileSync('data/static/CodeFixes.yml'))

interface FixesRequestParams {
  key: string
}

interface VerdictRequestBody {
  key: string
  selectedFix: number
}

const challenges: any = {}
for (const challenge of codeFixes) {
  challenges[challenge.key] = {
    fixes: challenge.fixes,
    correct: challenge.correct
  }
}

export const serveCodeFixes = () => (req: Request<FixesRequestParams, {}, {}>, res: Response, next: NextFunction) => {
  if (challenges[req.params.key] === undefined) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }
  res.status(200).json({
    fixes: challenges[req.params.key].fixes
  })
}

export const checkCorrectFix = () => (req: Request<{}, {}, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const challenge = req.body.key
  const selectedFix = req.body.selectedFix

  if (challenges[challenge] === undefined) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }

  if (selectedFix === challenges[challenge].correct) {
    res.status(200).json({
      verdict: true
    })
  } else {
    res.status(200).json({
      verdict: false
    })
  }
}
