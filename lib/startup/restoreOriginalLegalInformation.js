const path = require('path')
const fs = require('fs-extra')

const restoreOriginalLegalInformation = () => {
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/legal.md'), path.resolve(__dirname, '../../ftp/legal.md'))
}

module.exports = restoreOriginalLegalInformation
