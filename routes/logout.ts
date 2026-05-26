import { type Request, type Response } from 'express'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'

export function logout () {
  return (req: Request, res: Response) => {
    const token = utils.jwtFrom(req) || req.cookies?.token

    if (token) {
      security.revokeToken(token)
      security.authenticatedUsers.delete(token)
    }

    res.clearCookie('token')
    res.status(200).json({ status: 'success' })
  }
}
