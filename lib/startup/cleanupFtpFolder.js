const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')

const cleanupFtpFolder = () => {
  glob(path.join(__dirname, '../../ftp/*.pdf'), (err, files) => {
    if (err) {
      console.log(err)
    } else {
      files.forEach(filename => {
        fs.remove(filename)
      })
    }
  })
}

module.exports = cleanupFtpFolder
