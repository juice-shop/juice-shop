const models = require('../models/index')
const utils = require('../lib/utils')

exports.sequelizeVulnerabilityChallenge = () => (req, res, next) => {
  models.Recycle.findAll({
    where: {
      id: JSON.parse(req.params['id'])
    }
  }).then((Recycle) => {
    return res.send(utils.queryResultToJson(Recycle))
  })
}

exports.blockRecycleItems = () => (req, res, next) => {
  let errMsg = { err: 'Sorry, this endpoint is not supported.' }
  return res.send(utils.queryResultToJson(errMsg))
}
