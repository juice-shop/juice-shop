```typescript
import fs from 'fs/promises'
import path from 'path'
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
        files.map(file => path.resolve(currPath, path.basename(file)))
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

// Rest of the code remains the same
```