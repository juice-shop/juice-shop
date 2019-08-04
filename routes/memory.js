const models = require('../models/index')

module.exports.addMemory = function addMemory () {
  return async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host')
    const record = {
      caption: req.body.caption,
      imagePath: url + '/images/' + req.file.filename,
      UserId: req.body.UserId
    }
    const memory = await models.Memory.create(record)
    res.status(200).json({ status: 'success', data: memory })
  }
}

module.exports.getMemory = function getMemory () {
  return async (req, res, next) => {
    const memories = await models.Memory.findAll()
    res.status(200).json({ status: 'success', data: memories })
  }
}
