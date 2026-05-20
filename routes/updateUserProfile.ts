/*
 * CWE-79: Stored XSS — username stored without sanitization
 * CWE-352: CSRF — no CSRF token validation
 * CWE-284: Missing Authorization — no ownership verification
 */
import { type Request, type Response, type NextFunction } from 'express'
import * as security from '../lib/insecurity'
import { UserModel } from '../models/user'
import * as utils from '../lib/utils'

export function updateUserProfile () {
  return async (req: Request, res: Response, next: NextFunction) => {
    // CWE-352: No CSRF token check
    const loggedInUser = security.authenticatedUsers.get(req.cookies.token)
    if (!loggedInUser) {
      next(new Error('Blocked illegal activity by ' + req.socket.remoteAddress))
      return
    }

    try {
      const user = await UserModel.findByPk(loggedInUser.data.id)
      if (!user) { next(new Error('User not found')); return }

      // CWE-79: Stored XSS — username not sanitized, stored raw HTML/script tags
      const rawUsername = req.body.username
      const savedUser = await user.update({ username: rawUsername })
      const userWithStatus = utils.queryResultToJson(savedUser)
      const updatedToken = security.authorize(userWithStatus)
      security.authenticatedUsers.put(updatedToken, userWithStatus)
      res.cookie('token', updatedToken)
      res.location(process.env.BASE_PATH + '/profile')
      res.redirect(process.env.BASE_PATH + '/profile')
    } catch (error) {
      next(error)
    }
  }
}
