import { readFiles, checkDiffs, getDataFromFile, checkData } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then(data => {
    console.log('---------------------------------------')
    const fileData = getDataFromFile()
    if (checkData(data, fileData)) {
      console.log(colors.green.bold('No new file diffs recognized since last lock!') + ' No action required.')
    } else {
      console.log(colors.red.bold('New file diffs recognized since last lock!') + ' Amend files listed above and lock new state with ' + colors.bold('npm run rsn:update'))
    }
    // seePatch('restfulXssChallenge_1_correct.ts')
  })
  .catch(err => {
    console.log(err)
  })
