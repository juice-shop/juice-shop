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

  const decoded = verifyCeremonyToken(regToken, 'passkey_reg')
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

  const { credential, aaguid } = verification.registrationInfo
  const credentialID = credential.id
  const publicKey = isoBase64URL.fromBuffer(credential.publicKey)
  const transports = (attestation.response?.transports ?? []).join(',')

  const existing = await PasskeyModel.findOne({ where: { credentialID } })
  if (existing) {
    existing.publicKey = publicKey
    existing.counter = credential.counter
    existing.transports = transports
    existing.aaguid = aaguid
    await existing.save()
  } else {
    await PasskeyModel.create({ UserId: user.id, credentialID, publicKey, counter: credential.counter, transports, aaguid })
  }

  res.json({ verified: true })
}
