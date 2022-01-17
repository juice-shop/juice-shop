import { readFiles, checkDiffs, writeToFile } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then(({ okay, notOkay, data }) => {
    console.log(('---------------------------------------'))
    if (notOkay === 0) {
      console.log(colors.green('All files passed'))
    } else {
      console.log(colors.green('Total files passed: ' + okay))
      console.log(colors.red('Total files failed: ' + notOkay))

      writeToFile(data)
      console.log('All diffs are updated')
    }
  // seePatch('restfulXssChallenge_1_correct.ts')
  })
  .catch(err => {
    console.log(err)
  })
