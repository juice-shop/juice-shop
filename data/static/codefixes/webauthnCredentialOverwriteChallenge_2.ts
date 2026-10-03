/**
 * Verify a passkey registration and persist the new credential.
 */
export async function registerVerify (req: Request, res: Response) {
  const data = security.authenticatedUsers.from(req)
  if (!data) {
    res.status(401).send()
    return
  }
  const { data: user } = data
  const { attestation, regToken } = req.body
  const { rpID, origin } = relyingParty()

  const decoded = security.verify(regToken) && security.decode(regToken)
  if (!decoded || decoded.type !== 'webauthn_reg' || decoded.userId !== user.id) {
    res.status(401).send()
    return
  }

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: decoded.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID
  })
  if (!verification.verified || !verification.registrationInfo) {
    res.status(400).json({ error: 'not verified' })
    return
  }

  const { credential } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = isoBase64URL.fromBuffer(credential.publicKey)
  const transports = (attestation.response?.transports ?? []).join(',')

  const existing = await AuthenticatorModel.findOne({ where: { credentialID } })
  if (existing) {
    existing.publicKey = publicKey
    existing.counter = credential.counter
    existing.transports = transports
    await existing.save()
  } else {
    await AuthenticatorModel.create({ UserId: user.id, credentialID, publicKey, counter: credential.counter, transports })
  }

  res.json({ verified: true })
}
