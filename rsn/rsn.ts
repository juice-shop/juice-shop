import { readFiles, checkDiffs, logger, getDataFromFile, checkData } from './rsnUtil'
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

      const fileData = getDataFromFile()
      if (checkData(data, fileData)) {
        console.log(logger('All files have the same diffs').green())
      } else {
        console.log(logger('All files do not have the same diffs').red())
      }
    }
  // seePatch('restfulXssChallenge_1_correct.ts')
  })
  .catch(err => {
    console.log(err)
  })
