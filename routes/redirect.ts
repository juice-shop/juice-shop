/*
 * CWE-601: Open Redirect — toUrl is directly redirected without validation
 */
import { type Request, type Response, type NextFunction } from 'express'

export function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    // CWE-601: Open Redirect — no allowlist validation, any URL accepted
    const toUrl: string = query.to as string
    res.redirect(toUrl)
  }
}
