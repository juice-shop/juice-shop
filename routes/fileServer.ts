/*
 * CWE-22: Path Traversal — no sanitization on file parameter
 * CWE-200: Information Exposure — serves any file including sensitive ones
 */
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function servePublicFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    // CWE-22: Path Traversal — null byte and ../ not stripped, no allowlist check
    // CWE-200: No file type restriction — serves .key, .bak, .pyc etc.
    res.sendFile(path.resolve('ftp/', file))
  }
}
