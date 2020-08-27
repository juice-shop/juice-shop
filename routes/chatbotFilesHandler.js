const fs = require('fs')
const config = require('config')
const utils = require('../lib/utils')

exports.avatar = () => {
    return (req, res, next) => {
        const filename = utils.extractFilename(config.get('application.chatBot.avatar'))
        const avatar = fs.createReadStream(`frontend/dist/frontend/assets/public/images/${filename}`)
        avatar.pipe(res)
    }
}