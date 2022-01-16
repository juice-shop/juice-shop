import { readFiles, checkDiffs, logger, writeToFile } from './rsnUtil'
const keys = readFiles()
checkDiffs(keys)
  .then(({ okay, notOkay, data }) => {
    if (notOkay === 0) {
      console.log(logger('\n---------------------------------------').green())
      console.log(logger('All files passed').green())
    } else {
      console.log(logger('\n---------------------------------------').green())
      console.log(logger('Total files passed: ' + okay).green())
      console.log(logger('Total files failed: ' + notOkay).red())

      writeToFile(data)
      console.log('All diffs are updated')
    }
  // seePatch('restfulXssChallenge_1_correct.ts')
  })
  .catch(err => {
    console.log(err)
  })
