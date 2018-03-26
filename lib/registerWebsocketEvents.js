const notifications = require('../data/datacache').notifications
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
      const i = notifications.findIndex(({flag}) => flag === data)
      if (i > -1) {
        notifications.splice(i, 1)
      }
    })
  })
}

module.exports = registerWebsocketEvents
