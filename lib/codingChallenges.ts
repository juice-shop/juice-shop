import fs from 'node:fs/promises'
import path from 'node:path'
import logger from './logger'

export const SNIPPET_PATHS = Object.freeze(['./server.ts', './routes', './lib', './data', './data/static/web3-snippets', './frontend/src/app', './models', './infrastructure'])

interface FileMatch {
  path: string
  content: string
}

interface CachedCodeChallenge {
  snippet: string
  vulnLines: number[]
  neutralLines: number[]
}

export const findFilesWithCodeChallenges = async (paths: readonly string[]): Promise<FileMatch[]> => {
  const matches = []
  for (const currPath of paths) {
    try {
      if ((await fs.lstat(currPath)).isDirectory()) {
        const files = await fs.readdir(currPath)
        const moreMatches = await findFilesWithCodeChallenges(
          files.map(file => path.resolve(currPath, file))
        )
        matches.push(...moreMatches)
      } else {
        const code = await fs.readFile(currPath, 'utf8')
        if (
          // strings are split so that it doesn't find itself...
          code.includes('// vuln-code' + '-snippet start') ||
          code.includes('# vuln-code' + '-snippet start')
        ) {
          matches.push({ path: currPath, content: code })
        }
      }
    } catch (e) {
      logger.warn(`File ${currPath} could not be read. It might have been moved or deleted. If coding challenges are contained in the file, they will not be available.`)
    }
  }

  return matches
}

function getCodeChallengesFromFile (file: FileMatch) {
  const fileContent = file.content

  // get all challenges which are in the file by a regex capture group
  const challengeKeyRegex = /[#\/]{0,2} vuln-code-snippet start (?<challenges>[^\r\n]*)/g
  const challenges = [...fileContent.matchAll(challengeKeyRegex)]
    .flatMap(match => match.groups?.challenges?.trim().split(/\s+/) ?? [])
    .filter(Boolean)

  return challenges.map((challengeKey) => getCodingChallengeFromFileContent(fileContent, challengeKey))
}

export function getCodingChallengeFromFileContent (source: string, challengeKey: string) {
  const startMarker = `vuln-code-snippet start ${challengeKey}`
  const endMarker = `vuln-code-snippet end ${challengeKey}`
  const startIdx = source.indexOf(startMarker)
  const endIdx = source.indexOf(endMarker, startIdx === -1 ? 0 : startIdx)
  if (startIdx === -1 || endIdx === -1) {
    throw new BrokenBoundary('Broken code snippet boundaries for: ' + challengeKey)
  }
  let snippet = source.slice(startIdx, endIdx + endMarker.length) // TODO Currently only a single code snippet is supported
  let firstNewline = snippet.indexOf('\r\n')
  let nlLen = 2
  if (firstNewline === -1) {
    firstNewline = snippet.indexOf('\n')
    nlLen = 1
  }
  if (firstNewline === -1) {
    firstNewline = snippet.indexOf('\r')
    nlLen = 1
  }
  if (firstNewline !== -1) snippet = snippet.slice(firstNewline + nlLen)
  const endMarkerIdx = snippet.lastIndexOf(endMarker)
  if (endMarkerIdx !== -1) {
    snippet = snippet.slice(0, endMarkerIdx)
    if (snippet.endsWith('\r\n')) snippet = snippet.slice(0, -2)
    else if (snippet.endsWith('\n') || snippet.endsWith('\r')) snippet = snippet.slice(0, -1)
  }
  let normalized = snippet.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const hideStart = 'vuln-code-snippet hide-start'
  const hideEnd = 'vuln-code-snippet hide-end'
  let idx = normalized.indexOf(hideStart)
  while (idx !== -1) {
    const endHide = normalized.indexOf(hideEnd, idx)
    if (endHide === -1) {
      normalized = normalized.slice(0, idx)
      break
    }
    normalized = normalized.slice(0, idx) + normalized.slice(endHide + hideEnd.length)
    idx = normalized.indexOf(hideStart)
  }
  let lines = normalized.split('\n').filter(line => !line.includes('vuln-code-snippet hide-line'))
  const vulnLines = []
  const neutralLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.indexOf('vuln-code-snippet vuln-line') !== -1 && line.indexOf(challengeKey) !== -1) {
      vulnLines.push(i + 1)
    } else if (line.indexOf('vuln-code-snippet neutral-line') !== -1 && line.indexOf(challengeKey) !== -1) {
      neutralLines.push(i + 1)
    }
  }
  lines = lines.filter(line => !(line.indexOf('vuln-code-snippet vuln-line') !== -1 && line.indexOf(challengeKey) !== -1) && !(line.indexOf('vuln-code-snippet neutral-line') !== -1 && line.indexOf(challengeKey) !== -1))
  snippet = lines.join('\n').trim()
  return { challengeKey, snippet, vulnLines, neutralLines }
}

export class BrokenBoundary extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'BrokenBoundary'
    this.message = message
  }
}

// dont use directly, use getCodeChallenges getter
let _internalCodeChallenges: Map<string, CachedCodeChallenge> | null = null
export async function getCodeChallenges (): Promise<Map<string, CachedCodeChallenge>> {
  if (_internalCodeChallenges === null) {
    _internalCodeChallenges = new Map<string, CachedCodeChallenge>()
    const filesWithCodeChallenges = await findFilesWithCodeChallenges(SNIPPET_PATHS)
    for (const fileMatch of filesWithCodeChallenges) {
      for (const codeChallenge of getCodeChallengesFromFile(fileMatch)) {
        _internalCodeChallenges.set(codeChallenge.challengeKey, {
          snippet: codeChallenge.snippet,
          vulnLines: codeChallenge.vulnLines,
          neutralLines: codeChallenge.neutralLines
        })
      }
    }
  }
  return _internalCodeChallenges
}
