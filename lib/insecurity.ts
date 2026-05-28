// Updated isAuthorized implementation
export const isAuthorized = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : req.cookies.token
    // Reject request if no JWT
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'You need to be logged in to perform this action.' })
    }
    const decodedJws = jws.decode(token)
    if (decodedJws?.header.alg !== jws.ALGORITHMS[3]) {
      return res.status(401).json({ status: 'error', message: 'Token signature error'})
    } else {
      // Verify signature using RSA 256, or HMAC 256
      jwt.verify(token, publicKey, { audience: 'web', issuer: 'juice-shop', algorithms: ['HS256', 'RS256']  }, function (err, decoded) {
        if (err) {
          return res.status(401).json({ status: 'error', message: 'You need to be logged in to perform this action.' })
        } else {
          next()
        }
      })
    }
  }
}
// Add issuer, audience claims to our JWT creation
export const authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: '6h', algorithm: 'RS256', issuer: 'juice-shop', audience: 'web' })
