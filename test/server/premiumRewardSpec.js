var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('premiumReward', function () {
  var servePremiumContent, challenges, req, res
  var save = function () { return {success: function () {}} }

  beforeEach(function () {
    servePremiumContent = require('../../routes/premiumReward')
    challenges = require('../../data/datacache').challenges
    res = { sendFile: sinon.spy() }
    req = { }
  })

  it('should serve /app/private/under-construction.gif', function () {
    servePremiumContent()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/app[/\\]private[/\\]under-construction\.gif/))
  })

  it('should solve "premiumPaywallChallenge"', function () {
    challenges.premiumPaywallChallenge = { solved: false, save: save }

    servePremiumContent()(req, res)

    expect(challenges.premiumPaywallChallenge.solved).to.equal(true)
  })
})
