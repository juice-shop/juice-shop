/**
 * Verify a passkey assertion and sign the user in.
 */
export async function loginVerify (req: Request, res: Response) {
  const { assertion, authToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = verifyCeremonyToken(authToken, 'webauthn_auth')
  if (!decoded) {
    res.status(401).send()
    return
  }

  const authenticator = await AuthenticatorModel.findOne({ where: { credentialID: assertion?.id } })
  if (!authenticator) {
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
      id: authenticator.credentialID,
      publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
      counter: authenticator.counter,
      transports: toTransports(authenticator)
    }
  })

  if (!verification.verified) {
    res.status(401).send()
    return
  }

  const user = await UserModel.findByPk(authenticator.UserId)
  if (!user) {
    res.status(401).send(res.__('No account found for this passkey.'))
    return
  }

  authenticator.counter = verification.authenticationInfo.newCounter
  await authenticator.save()
  await issuePasskeySession(user, res)
}
