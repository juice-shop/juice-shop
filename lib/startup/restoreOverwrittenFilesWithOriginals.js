const path = require('path')
const fs = require('fs-extra')

const restoreOverwrittenFilesWithOriginals = () => {
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/legal.md'), path.resolve(__dirname, '../../ftp/legal.md'))
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/jingleSubtitles.vtt'), path.resolve(__dirname, '../../frontend/dist/frontend/assets/public/subtitles/jingleSubtitles.vtt'))
}

module.exports = restoreOverwrittenFilesWithOriginals
