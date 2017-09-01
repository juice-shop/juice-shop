const sinon = require('sinon')
const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)

describe('easterEgg', () => {
  let serveEasterEgg, challenges, req, res
  const save = () => ({
    success: function () {}
  })

  beforeEach(() => {
    serveEasterEgg = require('../../routes/easterEgg')
    challenges = require('../../data/datacache').challenges
    res = { sendFile: sinon.spy() }
    req = { }
  })

  it('should serve /app/private/threejs-demo.html', () => {
    serveEasterEgg()(req, res)

    expect(res.sendFile).to.have.been.calledWith(sinon.match(/app[/\\]private[/\\]threejs-demo\.html/))
  })

  it('should solve "easterEggLevelTwoChallenge"', () => {
    challenges.easterEggLevelTwoChallenge = { solved: false, save: save }

    serveEasterEgg()(req, res)

    expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true)
  })
})
