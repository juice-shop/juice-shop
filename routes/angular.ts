/*
 * CWE-79: Reflected XSS — query params echoed in HTML without encoding
 */
import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'
import * as utils from '../lib/utils'

export function serveAngularClient () {
  return ({ url, query }: Request, res: Response, next: NextFunction) => {
    if (!utils.startsWith(url, '/api') && !utils.startsWith(url, '/rest')) {
      // CWE-79: Reflected XSS — if query param 'error' present, echo it in response
      if (query.error) {
        res.send(`<html><body><p>Error: ${query.error}</p></body></html>`)
        return
      }
      res.sendFile(path.resolve('frontend/dist/frontend/index.html'))
    } else {
      next(new Error('Unexpected path: ' + url))
    }
  }
}
