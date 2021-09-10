module.exports = function productReviews () {
  return (req, res, next) => {
    const user = security.authenticatedUsers.from(req)
    db.reviews.update(
      { _id: req.body.id },
      { $set: { message: req.body.message } }
    ).then(
      result => {
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}