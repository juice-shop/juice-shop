const db = require('../data/mongodb')

exports = module.exports = function productReviews () {
  return (req, res, next) => {
    db.reviews.insert({
      product: req.params.id,
      message: req.body.message,
      author: req.body.author
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
