const frisby = require('frisby')

describe('Required Internet resource', () => {
  xit('PasteBin paste (https://pastebin.com/90dUgd7s) for "DLP Failure Tier 1" challenge available', () => {
    return frisby.get('https://pastebin.com/90dUgd7s')
      .expect('status', 200)
      .expect('bodyContains', 'Hueteroneel')
      .expect('bodyContains', 'this coupled with Eurogium Edule was sometimes found fatal')
  })

  it('PasteBin paste (https://pastebin.com/4U1V1UjU) for "DLP Failure Tier 2" challenge available', () => {
    return frisby.get('https://pastebin.com/4U1V1UjU')
      .expect('status', 200)
      .expect('bodyContains', 'current=0Y8rMnww$*9VFYE%C2%A759-!Fg1L6t&6lB')
  })

  it('GitHub issue (https://github.com/punkave/sanitize-html/issues/29) for "XSS Tier 4" challenge available', () => {
    return frisby.get('https://github.com/punkave/sanitize-html/issues/29')
      .expect('status', 200)
      .expect('bodyContains', 'Sanitization is not applied recursively')
      .expect('bodyContains', 'I am not harmless: <<img src="csrf-attack"/>img src="csrf-attack"/> is sanitized to I am not harmless: <img src="csrf-attack"/>')
  })
})
