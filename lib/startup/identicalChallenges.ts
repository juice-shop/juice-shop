import fs from 'graceful-fs'
import actualFs from 'fs'
import { SNIPPET_PATHS } from '../../routes/vulnCodeSnippet'

const path = require('path')

fs.gracefulify(actualFs)

interface CodingChallenge {
  [key: string]: any[]
}

// collect all the coding challenge names, startLine and endLine of snippets with their filepath
const challengeGroups: CodingChallenge = {}
// stores identical (overlapping) coding challenges in pairs
export const identicalChallengePairs: CodingChallenge = {}

const identicalChallenges = async () => {
  await retrieveChallengesWithCodeSnippets(SNIPPET_PATHS)
  await getIdenticalChallengePairs()
}

const retrieveChallengesWithCodeSnippets = async (paths: readonly string[]) => {
  const snippetStart = 'vuln-code-snippet start'
  const snippetEnd = 'vuln-code-snippet end'

  for (const currPath of paths) {
    if (fs.lstatSync(currPath).isDirectory()) {
      const files = fs.readdirSync(currPath)
      await retrieveChallengesWithCodeSnippets(files.map(file => path.join(currPath, file)))
    } else {
      const content = fs.readFileSync(currPath)
      const data = content.toString()
      const lines = data.split('\n')
      lines.forEach((line: string, lineNumber: number) => {
        if (line.includes(snippetStart)) {
          const challenges = line.trim().split(' ').filter(c => c.endsWith('Challenge'))
          challenges.forEach((challenge) => {
            if (!challengeGroups[currPath]) {
              challengeGroups[currPath] = []
            }
            challengeGroups[currPath].push({
              challengeName: challenge,
              startLine: lineNumber + 1,
              endLine: lineNumber + 1
            })
          })
        }
        if (line.includes(snippetEnd)) {
          const challenges = line.trim().split(' ').filter(c => c.endsWith('Challenge'))
          challenges.forEach((challenge) => {
            const obj = challengeGroups[currPath].find(c => c.challengeName === challenge)
            if (obj) {
              obj.endLine = lineNumber + 1
            }
          })
        }
      })
    }
  }
}

const getIdenticalChallengePairs = async () => {
  for (const [key, values] of Object.entries(challengeGroups)) {
    const overlappingPairs = new Set()

    for (const [index, value] of values.entries()) {
      for (const othervalue of values.slice(index + 1)) {
        if (challengesOverlap(value, othervalue)) {
          overlappingPairs.add([value.challengeName, othervalue.challengeName])
        }
      }
    }

    if (overlappingPairs.size > 0) {
      identicalChallengePairs[key] = Array.from(overlappingPairs)
    }
  }
}

// check if two challenges overlap
const challengesOverlap = (c1: CodingChallenge, c2: CodingChallenge): Boolean => {
  if (c1.startLine <= c2.endLine && c1.endLine >= c2.startLine) {
    return true
  }
  return false
}

module.exports = identicalChallenges
