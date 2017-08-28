'use strict'

const db = require('../data/mongodb')

exports = module.exports = function productReviews () {
  return function (req, res, next) {
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author
    }).then(function (result) {
      res.status(201).json({ staus: 'success' })
    }, function (err) {
      res.status(500).json(err)
    })
  }
}
