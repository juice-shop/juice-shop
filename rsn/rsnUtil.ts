import fs from 'node:fs'
import { diffLines, structuredPatch } from 'diff'
import yaml from 'js-yaml'

import { retrieveCodeSnippet } from '../routes/vulnCodeSnippet'

const fixesPath = 'data/static/codefixes'
const cacheFile = 'rsn/cache.json'

type CacheData = Record<string, {
  added: number[]
  removed: number[]
}>

interface ChallengeInfo {
  fixes: Array<{ id: number, explanation: string }>
  hints: string[]
}

interface DiffLine {
  type: 'added' | 'removed' | 'context'
  content: string
}

interface ChallengeDiff {
  file: string
  challengeName: string
  explanation: string | null
  lines: DiffLine[]
}

function readFiles () {
  const files = fs.readdirSync(fixesPath)
  const keys = files.filter((file: string) => !file.endsWith('.info.yml') && !file.endsWith('.editorconfig'))
  return keys
}

function writeToFile (json: CacheData) {
  fs.writeFileSync(cacheFile, JSON.stringify(json, null, '\t'))
}

function getDataFromFile () {
  const data = fs.readFileSync(cacheFile).toString()
  return JSON.parse(data)
}

function filterString (text: string) {
  text = text.replace(/\r/g, '')
  return text
}

const computeDiffs = async (keys: string[]) => {
  const data: CacheData = keys.reduce<CacheData>((prev, curr) => {
    return {
      ...prev,
      [curr]: {
        added: [],
        removed: []
      }
    }
  }, {})
  for (const val of keys) {
    try {
      const snippet = await retrieveCodeSnippet(val.split('_')[0])
      if (snippet == null) continue
      const fileData = fs.readFileSync(fixesPath + '/' + val).toString()
      const diff = diffLines(filterString(fileData), filterString(snippet.snippet))
      let line = 0
      for (const part of diff) {
        if (!part.count) continue
        if (part.removed) continue
        const prev = line
        line += part.count
        if (!part.added) continue
        for (let i = 0; i < part.count; i++) {
          if (!snippet.vulnLines.includes(prev + i + 1) && !snippet.neutralLines.includes(prev + i + 1)) {
            data[val].added.push(prev + i + 1)
          }
        }
      }
      line = 0
      let norm = 0
      for (const part of diff) {
        if (!part.count) continue
        if (part.added) {
          norm--
          continue
        }
        const prev = line
        line += part.count
        if (!part.removed) continue
        let temp = norm
        for (let i = 0; i < part.count; i++) {
          if (!snippet.vulnLines.includes(prev + i + 1 - norm) && !snippet.neutralLines.includes(prev + i + 1 - norm)) {
            data[val].removed.push(prev + i + 1 - norm)
          }
          temp++
        }
        norm = temp
      }
    } catch (err) {
      console.error(err)
    }
  }
  return data
}

function findChangedFiles (current: CacheData, cached: CacheData): string[] {
  const changed: string[] = []
  for (const key in current) {
    if (!cached[key]) {
      changed.push(key)
      continue
    }
    const curAdded = [...current[key].added].sort((a, b) => a - b)
    const cacAdded = [...cached[key].added].sort((a, b) => a - b)
    const curRemoved = [...current[key].removed].sort((a, b) => a - b)
    const cacRemoved = [...cached[key].removed].sort((a, b) => a - b)
    if (
      curAdded.length !== cacAdded.length ||
      curRemoved.length !== cacRemoved.length ||
      !curAdded.every((val, i) => cacAdded[i] === val) ||
      !curRemoved.every((val, i) => cacRemoved[i] === val)
    ) {
      changed.push(key)
    }
  }
  return changed
}

function loadChallengeInfo (challengeName: string): ChallengeInfo | null {
  const infoPath = `${fixesPath}/${challengeName}.info.yml`
  if (!fs.existsSync(infoPath)) return null
  const content = fs.readFileSync(infoPath, 'utf-8')
  return yaml.load(content) as ChallengeInfo
}

function getFixExplanation (file: string, info: ChallengeInfo | null): string | null {
  if (!info) return null
  const match = file.match(/_(\d+)/)
  if (!match) return null
  const fixId = parseInt(match[1])
  const fix = info.fixes.find(f => f.id === fixId)
  return fix?.explanation ?? null
}

async function computeChallengeDiff (file: string): Promise<ChallengeDiff | null> {
  const challengeName = file.split('_')[0]
  const info = loadChallengeInfo(challengeName)
  const explanation = getFixExplanation(file, info)

  const snippet = await retrieveCodeSnippet(challengeName)
  if (!snippet) return null

  const fileData = fs.readFileSync(fixesPath + '/' + file).toString()
  const patch = structuredPatch(file, file, filterString(snippet.snippet), filterString(fileData))

  const lines: DiffLine[] = []
  for (const hunk of patch.hunks) {
    for (const line of hunk.lines) {
      if (line[0] === '-') {
        lines.push({ type: 'removed', content: line })
      } else if (line[0] === '+') {
        lines.push({ type: 'added', content: line })
      } else {
        lines.push({ type: 'context', content: line })
      }
    }
  }

  return { file, challengeName, explanation, lines }
}

export {
  readFiles,
  writeToFile,
  getDataFromFile,
  filterString,
  computeDiffs,
  findChangedFiles,
  loadChallengeInfo,
  getFixExplanation,
  computeChallengeDiff
}

export type {
  CacheData,
  ChallengeInfo,
  DiffLine,
  ChallengeDiff
}
