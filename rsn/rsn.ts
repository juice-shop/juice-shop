import { readFiles, checkDiffs, getDataFromFile, checkData } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then(({ okay, notOkay, data }) => {
    console.log('---------------------------------------')
    if (notOkay === 0) {
      console.log(colors.green('All files passed'))
    } else {
      console.log(colors.green('Total files passed: ' + okay))
      console.log(colors.red('Total files failed: ' + notOkay))

      const fileData = getDataFromFile()
      if (checkData(data, fileData)) {
        console.log(colors.green('All files have the same diffs'))
      } else {
        console.log(colors.red('Not all files have the same diffs'))
      }
    }
  })
  .catch(err => {
    console.log(err)
  })
