it('should set up 2FA directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
  fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
    const FAKE_PASSWORD = 'FAKE_PASSWORD'
    const FAKE_INITIAL_TOKEN = 'FAKE_INITIAL_TOKEN'
    const FAKE_SETUP_TOKEN = 'FAKE_SETUP_TOKEN'

    let res: any
    service.setup(FAKE_PASSWORD, FAKE_INITIAL_TOKEN, FAKE_SETUP_TOKEN).subscribe((data) => (res = data))

    const req = httpMock.expectOne('http://localhost:3000/rest/2fa/setup')
    req.flush({})
    tick()

    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({
      password: FAKE_PASSWORD,
      initialToken: FAKE_INITIAL_TOKEN,
      setupToken: FAKE_SETUP_TOKEN
    })
    expect(res).toBe(undefined)
    httpMock.verify()
  })
))

it('should disable 2FA directly via the rest api', inject([TwoFactorAuthService, HttpTestingController],
  fakeAsync((service: TwoFactorAuthService, httpMock: HttpTestingController) => {
    const FAKE_PASSWORD = 'FAKE_PASSWORD'

    let res: any
    service.disable(FAKE_PASSWORD).subscribe((data) => (res = data))

    const req = httpMock.expectOne('http://localhost:3000/rest/2fa/disable')
    req.flush({})
    tick()

    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({ password: FAKE_PASSWORD })
    expect(res).toBe(undefined)
    httpMock.verify()
  })
))
