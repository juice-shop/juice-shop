import { readFiles, checkDiffs, writeToFile } from './rsnUtil'
const colors = require('colors/safe')

const keys = readFiles()
checkDiffs(keys)
  .then(data => {
    console.log(('---------------------------------------'))
    writeToFile(data)
    console.log(colors.bold('All file diffs have been locked!') + ' Commit changed cache.json to git.')
  // seePatch('restfulXssChallenge_1_correct.ts')
  })
  .catch(err => {
    console.log(err)
  })
