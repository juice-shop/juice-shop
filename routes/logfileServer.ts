/*
 * CWE-22: Path Traversal — log file parameter not sanitized, ../ allowed
 * CWE-200: Information Exposure — serves any file in logs/ directory
 */
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveLogFiles () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const file = params.file

    // CWE-22: Path Traversal — forward slash check removed, ../ traversal possible
    // CWE-200: No restriction on which log files can be served
    res.sendFile(path.resolve('logs/', file))
  }
}
