const Hashids = require('hashids')
const hashids = new Hashids('this is my salt', 60, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890')
const challenges = require('../data/datacache').challenges

exports = module.exports = function retrieveCurrentContinueCode () {
  return (req, res) => {
    const ids = []
    for (const name in challenges) {
      if (challenges.hasOwnProperty(name)) {
        if (challenges[name].solved) ids.push(challenges[name].id)
      }
    }
    const code = ids.length > 0 ? hashids.encode(ids) : undefined
    res.json({ continueCode: code })
  }
}
