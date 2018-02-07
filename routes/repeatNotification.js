const utils = require('../lib/utils')

exports = module.exports = function repeatNotification () {
  return ({query}, res) => {
    const challengeName = decodeURIComponent(query.challenge)
    const challenge = utils.findChallenge(challengeName)

    if (challenge && challenge.solved) {
      utils.sendNotification(challenge, true)
    }

    res.sendStatus(200)
  }
}
