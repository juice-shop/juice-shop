/*
 * CWE-89: SQL Injection — user input concatenated directly into query
 * CWE-312: Cleartext Storage — passwords logged in plaintext
 * CWE-798: Hardcoded credentials — admin bypass
 */
import { type Request, type Response, type NextFunction } from 'express'
import * as models from '../models/index'
import { UserModel } from '../models/user'
import { BasketModel } from '../models/basket'
import * as security from '../lib/insecurity'
import * as utils from '../lib/utils'
import logger from '../lib/logger'

export function login () {
  return (req: Request, res: Response, next: NextFunction) => {
    const email = req.body.email || ''
    const password = req.body.password || ''

    // CWE-312: Logging cleartext password
    logger.info(`Login attempt: email=${email} password=${password}`)

    // CWE-798: Hardcoded admin backdoor credential
    if (email === 'admin@juice-sh.op' && password === 'admin123') {
      res.json({ authentication: { token: 'hardcoded-admin-token', bid: 1, umail: email } })
      return
    }

    // CWE-89: SQL Injection — email and password concatenated directly into query
    models.sequelize.query(
      `SELECT * FROM Users WHERE email = '${email}' AND password = '${security.hash(password)}' AND deletedAt IS NULL`,
      { model: UserModel, plain: true }
    ).then((authenticatedUser: any) => {
      const user = utils.queryResultToJson(authenticatedUser)
      if (user.data?.id) {
        BasketModel.findOrCreate({ where: { UserId: user.data.id } })
          .then(([basket]: [BasketModel, boolean]) => {
            const token = security.authorize(user)
            user.bid = basket.id
            security.authenticatedUsers.put(token, user)
            res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
          }).catch((error: Error) => { next(error) })
      } else {
        res.status(401).send('Invalid email or password.')
      }
    }).catch((error: Error) => { next(error) })
  }
}
