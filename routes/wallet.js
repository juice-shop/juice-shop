const models = require('../models/index')

module.exports.getWalletBalance = function getWalletBalance () {
  return async (req, res, next) => {
    const wallet = await models.Wallet.findOne({ where: { UserId: req.body.UserId } })
    if (wallet) {
      res.status(200).json({ status: 'success', data: wallet.balance })
    } else {
      res.status(400).json({ status: 'error' })
    }
  }
}

module.exports.addWalletBalance = function addWalletBalance () {
  return async (req, res, next) => {
    const wallet = await models.Wallet.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } })
    if (wallet) {
      res.status(200).json({ status: 'success', data: wallet.balance })
    } else {
      res.status(400).json({ status: 'error' })
    }
  }
}
