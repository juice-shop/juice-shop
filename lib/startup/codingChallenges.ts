import fs from 'graceful-fs'
import actualFs from 'fs'
import path from 'path'

fs.gracefulify(actualFs)

export const SNIPPET_PATHS = Object.freeze(['./server.ts', './routes', './lib', './data', './frontend/src/app', './models'])

interface CodingChallenge {
  challengeName: string
  startLine: number
  endLine: number
}

interface Match {
  [key: string]: CodingChallenge[]
}

let matches: Match = {}
const identicalChallengeGroups = new Array<string[]>()

const fileSniff = async (paths: readonly string[], match1: RegExp, match2: RegExp): Promise<Match> => {
  for (const currPath of paths) {
    if (fs.lstatSync(currPath).isDirectory()) {
      const filePromises = await fs.promises.readdir(currPath)
      const files = filePromises.map(file => path.join(currPath, file))
      const moreMatches = await fileSniff(files, match1, match2)
      matches = { ...matches, ...moreMatches }
    } else {
      const content = await fs.promises.readFile(currPath)
      const data = content.toString()
      const lines = data.split('\n')
      lines.forEach((line: string, lineNumber: number) => {
        if (match1.test(line)) {
          const challenges = line.trim().split(' ').filter(c => c.endsWith('Challenge'))
          const identicalChallenges: string[] = []
          identicalChallenges.push(...challenges)
          challenges.forEach((challenge) => {
            if (!matches[currPath]) {
              matches[currPath] = []
            }
            matches[currPath].push({
              challengeName: challenge,
              startLine: lineNumber + 1,
              endLine: lineNumber + 1
            })
            matches[currPath].forEach(codingChallenge => {
              if (codingChallenge.startLine === codingChallenge.endLine) {
                identicalChallenges.push(codingChallenge.challengeName)
                if (identicalChallengeGroups.length !== 0) {
                  if (identicalChallengeGroups[identicalChallengeGroups.length - 1].includes(codingChallenge.challengeName)) {
                    identicalChallengeGroups.pop()
                  }
                }
                identicalChallengeGroups.push(identicalChallenges)
              }
            })
          })
        }
        if (match2.test(line)) {
          const challenges = line.trim().split(' ').filter(c => c.endsWith('Challenge'))
          challenges.forEach((challenge) => {
            const ch = matches[currPath].find(c => c.challengeName === challenge)
            if (ch) {
              ch.endLine = lineNumber + 1
            }
          })
        }
      })
    }
  }
  return matches
}

const removeDuplicatesFromIdenticalChallengeGroups = () => {
  const set = new Set<string>()
  const uniqueArr: string[][] = []

  for (let subArr of identicalChallengeGroups) {
    const str = subArr.sort().join(',')
    if (!set.has(str)) {
      set.add(str)
      subArr = [...new Set(subArr)]
      uniqueArr.push(subArr)
    }
  }
  return uniqueArr
}

export const getCodingChallenges = async () => {
  if (Object.keys(matches).length === 0) {
    matches = await fileSniff(SNIPPET_PATHS, /vuln-code-snippet start/, /vuln-code-snippet end/)
  }
  const identicalChallenges = removeDuplicatesFromIdenticalChallengeGroups()
  return identicalChallenges
}
