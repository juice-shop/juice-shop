var sinon = require('sinon')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)

describe('easterEgg', function () {
  var serveEasterEgg, challenges, req, res
  var save = function () { return {success: function () {}} }

  beforeEach(function () {
    serveEasterEgg = require('../../routes/easterEgg')
    challenges = require('../../data/datacache').challenges
    res = { sendFile: sinon.spy() }
    req = { }
  })

  it('should serve /app/private/threejs-demo.html', function () {
    serveEasterEgg()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/app[/\\]private[/\\]threejs-demo\.html/))
  })

  it('should solve "easterEggLevelTwoChallenge"', function () {
    challenges.easterEggLevelTwoChallenge = { solved: false, save: save }

    serveEasterEgg()(req, res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
