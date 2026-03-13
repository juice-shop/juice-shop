export const validateRecycleOrderId = () => (req: Request, res: Response) => {
  const orderId = req.query.orderId as string

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' })
  }

  const orderIdFormat = /^([0-9a-f]+(-[0-9a-f]*)?)+$/

  const start = Date.now()
  let isValid = false
  try {
    // Set a timeout for regex execution
    const timeoutId = setTimeout(() => {
      throw new Error('Regex timeout')
    }, 1000)
    isValid = orderIdFormat.test(orderId)
    clearTimeout(timeoutId)
  } catch (error) {
    isValid = false
  }
  const duration = Date.now() - start

  challengeUtils.solveIf(challenges.redosChallenge, () => { return duration > 2000 })

  return res.json({ valid: isValid })
}