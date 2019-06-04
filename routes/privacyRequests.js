const utils = require('../lib/utils')
const models = require('../models/index')

module.exports = function retrievePrivacyRequestsList () {
  return (req, res, next) => {
    models.PrivacyRequests.findAll().then(requests => {
      const privacyRequests = utils.queryResultToJson(requests)
      res.json(privacyRequests)
    }).catch(error => {
      next(error)
    })
  }
}
