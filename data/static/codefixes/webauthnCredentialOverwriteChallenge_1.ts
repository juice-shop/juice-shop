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
  const { rpID, origin } = relyingParty(req)

  const decoded = verifyCeremonyToken(regToken, 'webauthn_reg')
  if (!decoded || decoded.userId !== user.id) {
    res.status(401).send()
    return
  }

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: decoded.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    supportedAlgorithmIDs
  })
  if (!verification.verified || !verification.registrationInfo) {
    res.status(400).json({ error: 'not verified' })
    return
  }

  const { credential } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = isoBase64URL.fromBuffer(credential.publicKey)
  const transports = (attestation.response?.transports ?? []).join(',')

  const existing = await AuthenticatorModel.findOne({ where: { credentialID, UserId: user.id } })
  if (existing) {
    res.status(409).json({ error: 'credentialID already registered' })
    return
  }

  await AuthenticatorModel.create({ UserId: user.id, credentialID, publicKey, counter: credential.counter, transports })

  res.json({ verified: true })
}
