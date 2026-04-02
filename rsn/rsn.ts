import { readFiles, computeDiffs, getDataFromFile, findChangedFiles, computeChallengeDiff } from './rsnUtil'
import { printSuccess, printChangeSummary, printChallengeDiff, printUpdateInstructions } from './rsnOutput'

async function main () {
  const keys = readFiles()
  const currentData = await computeDiffs(keys)
  const cachedData = getDataFromFile()
  const changedFiles = findChangedFiles(currentData, cachedData)

  if (changedFiles.length === 0) {
    printSuccess()
  } else {
    printChangeSummary(changedFiles.length)
    for (const file of changedFiles) {
      const diff = await computeChallengeDiff(file)
      if (diff) printChallengeDiff(diff)
    }
    printUpdateInstructions()
    process.exitCode = 1
  }
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
