export const validateRecycleOrderId = () => (req: Request, res: Response) => {
  const orderId = req.query.orderId as string

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  // Alternative validation using string methods
  const parts = orderId.split('-')
  let isValid = true
  for (const part of parts) {
    if (!/^[0-9a-f]+$/.test(part)) {
      isValid = false
      break
    }
  }

  const start = Date.now()
  // Simulate some processing time for challenge detection
  const duration = Date.now() - start

  challengeUtils.solveIf(challenges.redosChallenge, () => { return duration > 2000 })

  return res.json({ valid: isValid })
}