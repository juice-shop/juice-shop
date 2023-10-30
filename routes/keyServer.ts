import path = require('path')
import { type Request, type Response, type NextFunction } from 'express'

// Define a whitelist of allowed file names
const allowedFiles = ['file1', 'file2', 'file3']

module.exports = function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    // Check if the file is in the whitelist
    if (allowedFiles.includes(file)) {
      // Use path.basename to prevent path traversal attacks
      res.sendFile(path.resolve('encryptionkeys/', path.basename(file)))
    } else {
      res.status(403)
      next(new Error('Invalid file name!'))
    }
  }
}