import { Request, Response, NextFunction } from 'express'
const fs = require('fs')

const FixesDir = 'data/static/CodeFixes'
const files = fs.readdirSync(FixesDir)
const CodeFixes: any = {}
for (const file of files) {
  const fix = fs.readFileSync(`${FixesDir}/${file}`).toString()
  const metadata = file.split('_')
  const key = metadata[0]
  const number = metadata[1]
  if (!CodeFixes[key]) {
    CodeFixes[key] = {}
    CodeFixes[key].fixes = []
  }
  CodeFixes[key].fixes.push(fix)
  if (metadata.length === 3) {
    CodeFixes[key].correct = parseInt(number, 10)
  }
}

interface FixesRequestParams {
  key: string
}

interface VerdictRequestBody {
  key: string
  selectedFix: number
}

export const serveCodeFixes = () => (req: Request<FixesRequestParams, {}, {}>, res: Response, next: NextFunction) => {
  if (CodeFixes[req.params.key] === undefined) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }
  res.status(200).json({
    fixes: CodeFixes[req.params.key].fixes
  })
}

export const checkCorrectFix = () => (req: Request<{}, {}, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const challenge = req.body.key
  const selectedFix = req.body.selectedFix

  if (CodeFixes[challenge] === undefined) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }

  if (selectedFix === CodeFixes[challenge].correct) {
    res.status(200).json({
      verdict: true
    })
  } else {
    res.status(200).json({
      verdict: false
    })
  }
}
