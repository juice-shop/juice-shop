/**
 * Verify a passkey assertion and sign the user in.
 */
export async function loginVerify (req: Request, res: Response) {
  const { assertion, authToken } = req.body
  const { rpID, origin } = relyingParty(req)

  const decoded = security.verify(authToken) && security.decode(authToken)
  if (!decoded || decoded.type !== 'webauthn_auth') {
    res.status(401).send()
    return
  }

  const authenticator = await AuthenticatorModel.findOne({ where: { credentialID: assertion.id } })
  if (!authenticator) {
    res.status(401).send()
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
      transports: authenticator.transports ? authenticator.transports.split(',') as any : undefined
    }
  })

  if (!verification.verified) {
    res.status(401).send()
    return
  }

  const user = await UserModel.findByPk(authenticator.UserId)
  if (!user) {
    res.status(401).send()
    return
  }

  await issuePasskeySession(user, res)

  authenticator.counter = verification.authenticationInfo.newCounter
  await authenticator.save()
}
