export const validateRecycleOrderId = () => (req: Request, res: Response) => {
  const orderId = req.query.orderId as string

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  const orderIdFormat = /^[0-9a-f]+(-[0-9a-f]+)*$/

  const start = Date.now()
  const isValid = orderIdFormat.test(orderId)
  const duration = Date.now() - start

  challengeUtils.solveIf(challenges.redosChallenge, () => { return duration > 2000 })

  return res.json({ valid: isValid })
}