import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    let file = String(params.file || '')
    try {
      file = decodeURIComponent(file)
    } catch {
      res.status(403)
      return next(new Error('Invalid file name encoding!'))
    }
    const safeName = path.basename(file)
    if (safeName !== file) {
      res.status(403)
      return next(new Error('Invalid file name!'))
    }
    if (file.includes('..') || file.includes('/') || file.includes('\\') || file.includes(':')) {
      res.status(403)
      return next(new Error('Invalid file name!'))
    }
    const baseDir = path.resolve('encryptionkeys')
    const absPath = path.resolve(baseDir, file)

    if (!absPath.startsWith(baseDir + path.sep)) {
      res.status(403)
      return next(new Error('Access denied!'))
    }
    return res.sendFile(absPath)
  }
}