// require("colors");
import { retrieveCodeSnippet } from '../routes/vulnCodeSnippet'
const Diff = require('diff')
const fs = require('fs')
const fixesPath = 'data/static/codefixes'

function readFiles () {
  const files = fs.readdirSync(fixesPath)
  const keys = files.filter(file => file.endsWith('.ts'))
  return keys
}

function filterString (text: string) {
  text = text.replace(/\r/g, '')
  return text
}

const checkDiffs = async (keys: string[]) => {
  let okay = 0
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

  return [okay, keys.length-okay]
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

const keys = readFiles()
checkDiffs(keys)
.then(([okay, notOkay]) => {
  if(notOkay === 0) {
    console.log(logger('\n---------------------------------------').green())
    console.log(logger('All files passed').green())
  } else {
    console.log(logger('\n---------------------------------------').green())
    console.log(logger('Total files passed: '+okay).green())
    console.error(logger('Total files failed: '+notOkay).red())
  }
  // seePatch('restfulXssChallenge_1_correct.ts')
})