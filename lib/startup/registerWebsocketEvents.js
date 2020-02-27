const notifications = require('../../data/datacache').notifications
const utils = require('../utils')
const insecurity = require('../insecurity')
const challenges = require('../../data/datacache').challenges
let firstConnectedSocket = null

const registerWebsocketEvents = (server) => {
  const io = require('socket.io')(server)
  global.io = io

  io.on('connection', socket => {
    if (firstConnectedSocket === null) {
      socket.emit('server started')
      firstConnectedSocket = socket.id
    }

    notifications.forEach(notification => {
      socket.emit('challenge solved', notification)
    })

    socket.on('notification received', data => {
      const i = notifications.findIndex(({ flag }) => flag === data)
      if (i > -1) {
        notifications.splice(i, 1)
      }
    })

    socket.on('verifyLocalXssChallenge', data => {
      if (utils.notSolved(challenges.localXssChallenge) && utils.contains(data, '<iframe src="javascript:alert(`xss`)">')) {
        utils.solve(challenges.localXssChallenge)
      }
    })

    socket.on('verifySvgInjectionChallenge', data => {
      if (utils.notSolved(challenges.svgInjectionChallenge) && data && data.match(/.*\.\.\/\.\.\/\.\.\/\.\.\/redirect\?to=https?:\/\/placekitten.com\/(g\/)?[\d]+\/[\d]+.*/) && insecurity.isRedirectAllowed(data)) {
        utils.solve(challenges.svgInjectionChallenge)
      }
    })
  })
}

module.exports = registerWebsocketEvents
