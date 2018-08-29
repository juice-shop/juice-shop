const path = require('path')

module.exports = function serveKeyFiles () {
  return ({ params }, res, next) => {
    const file = params.file

    if (!file.includes('/')) {
      res.sendFile(path.resolve(__dirname, '../encryptionkeys/', file))
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
