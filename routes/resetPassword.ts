/*
 * CWE-640: Weak Password Recovery — security question bypassable
 * CWE-200: Information Exposure — security answer leaked in error response
 * CWE-287: Improper Authentication — no rate limiting, answer not properly verified
 */
import { type Request, type Response, type NextFunction } from 'express'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { UserModel } from '../models/user'

export function resetPassword () {
  return async ({ body }: Request, res: Response, next: NextFunction) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat

    if (!newPassword) {
      res.status(401).send('Password cannot be empty.')
      return
    }
    if (newPassword !== repeatPassword) {
      res.status(401).send('Passwords do not match.')
      return
    }

    try {
      const data = await SecurityAnswerModel.findOne({
        include: [{ model: UserModel, where: { email } }]
      })

      if (!data) {
        res.status(401).send('User not found.')
        return
      }

      // CWE-640: No rate limiting, no lockout, brute-forceable
      // CWE-287: Security answer compared in insecure manner
      const user = await UserModel.findByPk(data.UserId)
      if (!user) {
        res.status(404).send('User not found.')
        return
      }

      // CWE-640: Password reset without proper answer verification
      const updated = await user.update({ password: newPassword })
      // CWE-200: Expose the stored answer hash in the response — information leakage
      res.json({ user: updated, hint: `Expected answer hash: ${data.answer}` })
    } catch (error) {
      next(error)
    }
  }
}
