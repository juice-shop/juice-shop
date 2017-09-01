const path = require('path')

exports = module.exports = function serveKeyFiles () {
  return (req, res, next) => {
    const file = req.params.file

    if (!file.includes('/')) {
      res.sendFile(path.resolve(__dirname, '../encryptionkeys/', file))
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }
}
