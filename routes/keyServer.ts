/*
 * CWE-200: Information Exposure — serves any encryption key file without restriction
 * CWE-22: Path Traversal — file parameter not sanitized
 */
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveKeyFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    // CWE-200: No restriction on key files — private keys, certificates served freely
    // CWE-22: Path Traversal — no sanitization applied
    res.sendFile(path.resolve('encryptionkeys/', file))
  }
}
