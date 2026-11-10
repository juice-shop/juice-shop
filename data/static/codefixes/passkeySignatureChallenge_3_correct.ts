/**
 * Verify a passkey assertion and sign the user in.
 */
export async function loginVerify (req: Request, res: Response) {
  const { assertion, authToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = verifyCeremonyToken(authToken, 'passkey_auth')
  if (!decoded || typeof assertion?.id !== 'string') {
    res.status(401).send()
    return
  }

  const passkey = await PasskeyModel.findOne({ where: { credentialID: assertion.id } })
  if (!passkey) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge: decoded.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    requireUserVerification: false,
    credential: {
      id: passkey.credentialID,
      publicKey: isoBase64URL.toBuffer(passkey.publicKey),
      counter: passkey.counter,
      transports: toTransports(passkey)
    }
  })

  if (!verification.verified) {
    res.status(401).send()
    return
  }

  const user = await UserModel.findByPk(passkey.UserId)
  if (!user) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  passkey.counter = verification.authenticationInfo.newCounter
  await passkey.save()
  await issuePasskeySession(user, res)
}