const path = require('path')
const fs = require('fs-extra')

const restoreOverwrittenFilesWithOriginals = () => {
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/legal.md'), path.resolve(__dirname, '../../ftp/legal.md'))
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/JuiceShopJingle.vtt'), path.resolve(__dirname, '../../frontend/dist/frontend/assets/public/videos/JuiceShopJingle.vtt'))
  fs.copyFileSync(path.resolve(__dirname, '../../data/static/delivery.png'), path.resolve(__dirname, '../../frontend/dist/frontend/assets/public/images/deluxe/delivery.png'))
}

module.exports = restoreOverwrittenFilesWithOriginals
