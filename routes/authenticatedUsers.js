const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const models = require('../models/index')
const challenges = require('../data/datacache').challenges

module.exports = function retrieveUserList () {
  return (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)

    let callbackFunc = req.query.callback

    if (callbackFunc === 'getDetails') {
      models.User.findAll().then(users => {
        let referer = ''
        if (req.headers.referer) {
          referer = req.headers.referer
        }
        if (referer === 'thrift.juice-shop.com') {
          if (utils.notSolved(challenges.jsonpChallenge)) {
            utils.solve(challenges.jsonpChallenge)
          }
        }
        const usersWithLoginStatus = utils.queryResultToJson(users)
        usersWithLoginStatus.data.forEach(user => {
          user.token = insecurity.authenticatedUsers.tokenOf(user)
          user.password = user.password ? user.password.replace(/./g, '*') : null
        })
        const responseValue = 'getdetails(' + JSON.stringify(usersWithLoginStatus) + ')'
        res.setHeader('content-type', 'text/javascript')
        res.send(responseValue)
      }).catch(error => {
        next(error)
      })
    } else if (callbackFunc === undefined) {
      if (loggedInUser) {
        models.User.findAll().then(users => {
          const usersWithLoginStatus = utils.queryResultToJson(users)
          usersWithLoginStatus.data.forEach(user => {
            user.token = insecurity.authenticatedUsers.tokenOf(user)
            user.password = user.password ? user.password.replace(/./g, '*') : null
          })
          res.send(usersWithLoginStatus)
        }).catch(error => {
          next(error)
        })
      } else {
        let errMsg = { err: 'Your token is missing, method not allowed' }
        return res.send(utils.queryResultToJson(errMsg))
      }
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}
