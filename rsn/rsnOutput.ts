import colors from 'colors/safe'
import type { ChallengeDiff } from './rsnUtil'

function printSuccess () {
  console.log(colors.green(colors.bold('All codefix files match the locked state. No action required.')))
}

function printChangeSummary (count: number) {
  console.log(colors.red(colors.bold(`Refactoring Safety Net check failed: ${count} codefix file(s) are out of sync.`)))
  console.log('Your changes affect code inside a vuln-code-snippet block.')
  console.log('The diffs below show the codefix files as they will be shown in the coding challenges.')
  console.log('Update the corresponding codefix files in data/static/codefixes/ to match.\n')
}

function printChallengeDiff (diff: ChallengeDiff) {
  const border = '='.repeat(60)
  console.log(colors.cyan(colors.bold(border)))
  console.log(colors.cyan(colors.bold(`  Challenge: ${diff.challengeName}`)))
  console.log(colors.cyan(colors.bold(`  File: ${diff.file}`)))
  if (diff.explanation) {
    console.log(colors.cyan(colors.bold('  Explanation: ')) + diff.explanation)
  }
  console.log(colors.cyan(colors.bold(border)))

  for (const line of diff.lines) {
    if (line.type === 'removed') {
      console.log(colors.red(line.content))
    } else if (line.type === 'added') {
      console.log(colors.green(line.content))
    } else {
      console.log(line.content)
    }
  }
  console.log('')
}

function printUpdateInstructions () {
  console.log('After fixing the codefix files, run ' + colors.bold('npm run rsn') + ' again to verify.')
  console.log('Only if diffs are intentional and codefixes are updated, lock the new state with ' + colors.bold('npm run rsn:update'))
}

export {
  printSuccess,
  printChangeSummary,
  printChallengeDiff,
  printUpdateInstructions
}
