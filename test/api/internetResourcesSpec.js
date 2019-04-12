const frisby = require('frisby')

describe('Required Internet resource', () => {
  describe('PasteBin paste for "DLP Failure Tier 1" challenge available', () => {
    it('for default configuration (https://pastebin.com/90dUgd7s)', () => {
      return frisby.get('https://pastebin.com/90dUgd7s')
        .expect('status', 200)
        .expect('bodyContains', 'Hueteroneel')
        .expect('bodyContains', 'this coupled with Eurogium Edule was sometimes found fatal')
    })

    it('for 7MS configuration (https://pastebin.com/8SMbWPxc)', () => {
      return frisby.get('https://pastebin.com/8SMbWPxc')
        .expect('status', 200)
        .expect('bodyContains', 'TAYLOR SWIFT')
        .expect('bodyContains', 'KATY PERRY')
        .expect('bodyContains', '(Consider rivalries when picking song list for events as wrong combo could infuriate a mixed-fans audience, see https://www.nickiswift.com/2075/taylor-swifts-list-enemies)')
    })

    it('for BodgeIt Store configuration (https://pastebin.com/G47LrDr0)', () => {
      return frisby.get('https://pastebin.com/G47LrDr0')
        .expect('status', 200)
        .expect('bodyContains', 'Mind Blank - one willing creature you touch is immune any effect')
        .expect('bodyContains', 'They should seek out a Couatl, and undertake a quest to receive')
        .expect('bodyContains', 'They could acquire the aid of a rakshasa, and willingly invoke its')
        .expect('bodyContains', 'Note to self: Option (1) and (3) of the above should not be combined.')
    })

    it('for Mozilla configuration (https://pastebin.com/t8jqE1y7)', () => {
      return frisby.get('https://pastebin.com/t8jqE1y7')
        .expect('status', 200)
        .expect('bodyContains', 'Fixed a bug that, when this plugin was installed together with both the')
        .expect('bodyContains', 'JuiceNote')
        .expect('bodyContains', 'Magische Firefox Suche')
        .expect('bodyContains', 'plugins, lwt your browser throw a')
        .expect('bodyContains', 'JuiceOverFlowError')
        .expect('bodyContains', 'The problem can still occur post-fix but at least now less frequently!')
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
