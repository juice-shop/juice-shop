module.exports = function changePassword () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query, headers, connection } = req
      const currentPassword = query.current
      const newPassword = query.new?.toString()
      const repeatPassword = query.repeat

      if (!newPassword || newPassword === 'undefined') {
        return res.status(401).send(res.__('Password cannot be empty.'))
      }

      if (newPassword !== repeatPassword) {
        return res.status(401).send(res.__('New and repeated password do not match.'))
      }

      const token = headers.authorization?.replace(/^Bearer=?/, '')
      const loggedInUser = security.authenticatedUsers.get(token)

      if (!loggedInUser) {
        return next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      }

      if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
        return res.status(401).send(res.__('Current password is not correct.'))
      }

      const user = await UserModel.findByPk(loggedInUser.data.id)
      if (!user) return

      await user.update({ password: newPassword })

      challengeUtils.solveIf(
        challenges.changePasswordBenderChallenge,
        () => user.id === 3 && !currentPassword && user.password === security.hash('slurmCl4ssic')
      )

      return res.json({ user })
    } catch (error) {
      return next(error)
    }
  }
}
