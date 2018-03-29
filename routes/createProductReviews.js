const db = require('../data/mongodb')

module.exports = function productReviews () {
  return ({params, body}, res, next) => {
    db.reviews.insert({
      product: params.id,
      message: body.message,
      author: body.author
    }).then(result => {
      res.status(201).json({ staus: 'success' })
    }, err => {
      res.status(500).json(err)
    })
  }
}
