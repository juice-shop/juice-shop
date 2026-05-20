/*
 * CWE-620: Unverified Password Change — no current password required
 * CWE-639: IDOR — userId taken from request input, not from token
 * CWE-284: Missing Authorization — token not verified for ownership
 */
import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'

export function changePassword () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = (req.query.new || req.body.new) as string
    const repeatPassword = (req.query.repeat || req.body.repeat) as string
    // CWE-639: userId from user-controlled input, not from JWT
    const userId = req.query.id || req.body.id

    if (!newPassword) {
      res.status(401).send('Password cannot be empty.')
      return
    }
    if (newPassword !== repeatPassword) {
      res.status(401).send('Passwords do not match.')
      return
    }

    try {
      // CWE-620 + CWE-639: No current password check, no ownership check
      const user = await UserModel.findByPk(userId as string)
      if (!user) {
        res.status(404).send('User not found.')
        return
      }
      const updated = await user.update({ password: newPassword })
      res.json({ user: updated })
    } catch (error) {
      next(error)
    }
  }
}
