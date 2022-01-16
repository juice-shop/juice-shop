// require("colors");
import { retrieveCodeSnippet } from '../routes/vulnCodeSnippet'
const Diff = require('diff')
const fs = require('fs')
const fixesPath = 'data/static/codefixes'
const cacheFile = 'rsn/cache.json'

function readFiles () {
  const files = fs.readdirSync(fixesPath)
  const keys = files.filter(file => file.endsWith('.ts'))
  return keys
}

function writeToFile (json) {
  fs.writeFileSync(cacheFile, JSON.stringify(json))
}

function getDataFromFile () {
  const data = fs.readFileSync(cacheFile).toString()
  return JSON.parse(data)
}

function filterString (text: string) {
  text = text.replace(/\r/g, '')
  return text
}

const checkDiffs = async (keys: string[]) => {
  let okay = 0, data = keys.reduce((prev,curr) => {
    return {
      ...prev,
      [curr]: []
    }
  },{});
  for(const val of keys) {
    await retrieveCodeSnippet(val.split('_')[0], true)
      .then(snippet => {
        process.stdout.write(val + ': ')
        const fileData = fs.readFileSync(fixesPath + '/' + val).toString()
        const diff = Diff.diffLines(filterString(fileData), filterString(snippet.snippet))
        let line = 0
        let f = true
        for (const part of diff) {
          if (part.removed) continue
          const prev = line
          line += part.count
          if (!(part.added)) continue
          for (let i = 0; i < part.count; i++) {
            if (!snippet.vulnLines.includes(prev + i + 1) && !snippet.neutralLines.includes(prev + i + 1)) {
              process.stdout.write(logger(prev + i + 1 + ' ').red())
              data[val].push(prev + i + 1)
              f = false
            }
          }
        }
        line = 0
        let norm = 0
        for (const part of diff) {
          if (part.added) {
            norm--
            continue
          }
          const prev = line
          line += part.count
          if (!(part.removed)) continue
          let temp = norm
          for (let i = 0; i < part.count; i++) {
            if (!snippet.vulnLines.includes(prev + i + 1 - norm) && !snippet.neutralLines.includes(prev + i + 1 - norm)) {
              process.stdout.write(logger(prev + i + 1 - norm + ' ').green())
              data[val].push(prev + i + 1 - norm)
              f = false
            }
            temp++
          }
          norm = temp
        }
        if (f) {
          process.stdout.write('PASSED\n')
          okay++
        }
        else process.stdout.write(logger('\n').green())
      })
      .catch(err => {
        console.log(err)
      })
  }

  return {
    okay,
    notOkay: keys.length - okay,
    data
  }
}

function logger (text: string) {
  const colors = {
    FgGreen: '\x1b[32m',
    FgRed: '\x1b[31m',
    FgWhite: '\x1b[37m',
    end: '\x1b[0m'
  }
  return {
    green: function () {
      return colors.FgGreen + text + colors.end
    },
    red: function () {
      return colors.FgRed + text + colors.end
    }
  }
}

async function seePatch(file: string) {
  const fileData = fs.readFileSync(fixesPath + '/' + file).toString()
  const snippet = await retrieveCodeSnippet(file.split('_')[0], true)
  const patch = Diff.structuredPatch('sample.ts','sample6.ts',filterString(fileData), filterString(snippet.snippet),'oh','nh')
  console.log('@'+file+':\n')
  for(const hunk of patch.hunks) {
    console.log("--------patch--------")
    for(const line of hunk.lines) {
      if(line[0] === '-') {
        console.log(logger(line).red())
      } else if (line[0] === '+') {
        console.log(logger(line).green())
      } else {
        console.log(line)
      }
    }
 }

}

function checkData(data: object,fileData: object) {
  let same = true

  // console.log(fileData)
  for(const key in data) {
      const fileDataValue = fileData[key].sort((a,b) => a>b)
      const dataValue = data[key].sort((a,b) => a>b)
      if(fileDataValue.length === dataValue.length) {
          if(!dataValue.every((val: number,ind: number) => fileDataValue[ind] === val)) {
              console.log(logger(key).red())
              same = false
          }
      } else {
          console.log(logger(key).red())
          same = false
      }
  }


  return same
}

export {
  checkDiffs,
  writeToFile,
  getDataFromFile,
  readFiles,
  seePatch,
  logger,
  checkData
}