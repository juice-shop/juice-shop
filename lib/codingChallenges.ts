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
  const matches: FileMatch[] = [];
  for (const currPath of paths) {
    const moreMatches = await processPath(currPath);
    matches.push(...moreMatches);
  }
  return matches;
}

const processPath = async (currPath: string): Promise<FileMatch[]> => {
  if ((await fs.lstat(currPath)).isDirectory()) {
    return await processDirectory(currPath);
  } else {
    return await processFile(currPath);
  }
}

const processDirectory = async (directoryPath: string): Promise<FileMatch[]> => {
  const matches: FileMatch[] = [];
  const files = await fs.readdir(directoryPath);
  for (const file of files) {
    const filePath = path.resolve(directoryPath, file);
    const moreMatches = await findFilesWithCodeChallenges([filePath]);
    matches.push(...moreMatches);
  }
  return matches;
}

const processFile = async (filePath: string): Promise<FileMatch[]> => {
  const matches: FileMatch[] = [];
  try {
    const code = await fs.readFile(filePath, 'utf8');
    if (containsCodeChallenge(code)) {
      matches.push({ path: filePath, content: code });
    }
  } catch (e) {
    logger.warn(`File ${filePath} could not be read. It might have been moved or deleted. If coding challenges are contained in the file, they will not be available.`);
  }
  return matches;
}

const containsCodeChallenge = (code: string): boolean => {
  return code.includes('// vuln-code-snippet start') || code.includes('# vuln-code-snippet start');
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

function getCodingChallengeFromFileContent(source: string, challengeKey: string) {
  const snippet = extractSnippet(source, challengeKey);
  const { vulnLines, neutralLines } = extractLineNumbers(snippet, challengeKey);
  const cleanedSnippet = cleanSnippet(snippet);
  return { challengeKey, snippet: cleanedSnippet, vulnLines, neutralLines };
}

function extractSnippet(source: string, challengeKey: string): string {
  const snippets = source.match(`[/#]{0,2} vuln-code-snippet start.*${challengeKey}([^])*vuln-code-snippet end.*${challengeKey}`);
  if (snippets == null) {
    throw new BrokenBoundary('Broken code snippet boundaries for: ' + challengeKey);
  }
  return snippets[0];
}

function extractLineNumbers(snippet: string, challengeKey: string): { vulnLines: number[], neutralLines: number[] } {
  let lines = splitLines(snippet);
  const vulnLines: number[] = [];
  const neutralLines: number[] = [];
  
  lines.forEach((line, index) => {
    if (line.includes(`vuln-code-snippet vuln-line ${challengeKey}`)) {
      vulnLines.push(index + 1);
    } else if (line.includes(`vuln-code-snippet neutral-line ${challengeKey}`)) {
      neutralLines.push(index + 1);
    }
  });

  return { vulnLines, neutralLines };
}

function splitLines(snippet: string): string[] {
  return snippet.split(/\r?\n/);
}

function cleanSnippet(snippet: string): string {
  return snippet
    .replace(/\s?[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}/g, '')
    .replace(/\s?[/#]{0,2} vuln-code-snippet end.*/g, '')
    .replace(/.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}/g, '')
    .replace(/.*[/#]{0,2} vuln-code-snippet hide-start([^])*[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}/g, '')
    .trim();
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
