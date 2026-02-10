import fs from 'node:fs/promises'
import path from 'node:path'
import logger from './logger'

export const SNIPPET_PATHS = Object.freeze(['./server.ts', './routes', './lib', './data', './data/static/web3-snippets', './frontend/src/app', './models'])

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
    if ((await fs.lstat(currPath)).isDirectory()) {
      const files = await fs.readdir(currPath)
      const moreMatches = await findFilesWithCodeChallenges(
        files.map(file => path.resolve(currPath, file))
      )
      matches.push(...moreMatches)
    } else {
      try {
        const code = await fs.readFile(currPath, 'utf8')
        if (
          // strings are split so that it doesn't find itself...
          code.includes('// vuln-code' + '-snippet start') ||
          code.includes('# vuln-code' + '-snippet start')
        ) {
          matches.push({ path: currPath, content: code })
        }
      } catch (e) {
        logger.warn(`File ${currPath} could not be read. it might have been moved or deleted. If coding challenges are contained in the file, they will not be available.`)
      }
    }
  }

  return matches
}

function getCodeChallengesFromFile (file: FileMatch) {
  const fileContent = file.content

  // get all challenges which are in the file by a regex capture group
  const challengeKeyRegex = /[/#]{0,2} vuln-code-snippet start (?<challenges>.*)/g
  const challenges = [...fileContent.matchAll(challengeKeyRegex)]
    .flatMap(match => match.groups?.challenges?.split(' ') ?? [])
    .filter(Boolean)

  return challenges.map((challengeKey) => getCodingChallengeFromFileContent(fileContent, challengeKey))
}

function getCodingChallengeFromFileContent (source: string, challengeKey: string) {
  // Use non-greedy match and matchAll to support multiple code snippets for the same challenge
  const snippetRegex = new RegExp(`[/#]{0,2} vuln-code-snippet start.*${challengeKey}([^])*?vuln-code-snippet end.*${challengeKey}`, 'g')
  const allMatches = [...source.matchAll(snippetRegex)]
  if (allMatches.length === 0) {
    throw new BrokenBoundary('Broken code snippet boundaries for: ' + challengeKey)
  }

  const processedSnippets: string[] = []
  for (const match of allMatches) {
    let snippetPart = match[0]
    snippetPart = snippetPart.replace(/\s?[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}/g, '')
    snippetPart = snippetPart.replace(/\s?[/#]{0,2} vuln-code-snippet end.*/g, '')
    snippetPart = snippetPart.replace(/.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}/g, '')
    snippetPart = snippetPart.replace(/.*[/#]{0,2} vuln-code-snippet hide-start([^])*?[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}/g, '')
    snippetPart = snippetPart.trim()
    processedSnippets.push(snippetPart)
  }

  let snippet = processedSnippets.join('\n\n// ...\n\n')

  let lines = snippet.split('\r\n')
  if (lines.length === 1) lines = snippet.split('\n')
  if (lines.length === 1) lines = snippet.split('\r')
  const vulnLines: number[] = []
  const neutralLines: number[] = []
  for (let i = 0; i < lines.length; i++) {
    if (new RegExp(`vuln-code-snippet vuln-line.*${challengeKey}`).exec(lines[i]) != null) {
      vulnLines.push(i + 1)
    } else if (new RegExp(`vuln-code-snippet neutral-line.*${challengeKey}`).exec(lines[i]) != null) {
      neutralLines.push(i + 1)
    }
  }
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet vuln-line.*/g, '')
  snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet neutral-line.*/g, '')
  return { challengeKey, snippet, vulnLines, neutralLines }
}

class BrokenBoundary extends Error {
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
