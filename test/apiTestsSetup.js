const server = require('./../server.js')

module.exports = () => new Promise((resolve, reject) =>
  server.start(err => {
    if (err) {
      reject(err)
    }
    resolve()
  })
)
