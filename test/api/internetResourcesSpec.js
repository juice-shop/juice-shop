const frisby = require('frisby')

describe('Required Internet resource', () => {
  describe('PasteBin paste for "DLP Failure Tier 1" challenge available', () => {
    it('for default configuration (https://pastebin.com/90dUgd7s)', () => {
      return frisby.get('https://pastebin.com/90dUgd7s')
        .expect('status', 200)
        .expect('bodyContains', 'Hueteroneel')
        .expect('bodyContains', 'this coupled with Eurogium Edule was sometimes found fatal')
    })

    xit('for 7MS configuration (https://pastebin.com/________)', () => {
      fail()
    })

    xit('for BodgeIt Store configuration (https://pastebin.com/________)', () => {
      fail()
    })

    xit('for Mozilla configuration (https://pastebin.com/________)', () => {
      fail()
    })
  })

  it('PasteBin paste (https://pastebin.com/4U1V1UjU) for "DLP Failure Tier 2" challenge available', () => {
    return frisby.get('https://pastebin.com/4U1V1UjU')
      .expect('status', 200)
      .expect('bodyContains', 'current=0Y8rMnww$*9VFYE%C2%A759-!Fg1L6t&amp;6lB')
  })

  it('GitHub issue (https://github.com/punkave/sanitize-html/issues/29) for "XSS Tier 4" challenge available', () => {
    return frisby.get('https://github.com/punkave/sanitize-html/issues/29')
      .expect('status', 200)
      .expect('bodyContains', 'Sanitization is not applied recursively')
      .expect('bodyContains', 'I am not harmless: &lt;&lt;img src=&quot;csrf-attack&quot;/&gt;img src=&quot;csrf-attack&quot;/&gt; is sanitized to I am not harmless: &lt;img src=&quot;csrf-attack&quot;/&gt;')
  })
})
