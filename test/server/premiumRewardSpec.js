const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('premiumReward', () => {
  let servePremiumContent, challenges, req, res
  const save = () => ({
    success: function () {}
  })

  beforeEach(() => {
    servePremiumContent = require('../../routes/premiumReward')
    challenges = require('../../data/datacache').challenges
    res = { sendFile: sinon.spy() }
    req = { }
  })

  it('should serve /app/private/under-construction.gif', () => {
    servePremiumContent()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/app[/\\]private[/\\]under-construction\.gif/))
  })

  it('should solve "premiumPaywallChallenge"', () => {
    challenges.premiumPaywallChallenge = { solved: false, save: save }

    servePremiumContent()(req, res)

    expect(challenges.premiumPaywallChallenge.solved).to.equal(true)
  })
})
