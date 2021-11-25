module.exports = function productReviews () {
  return (req, res, next) => {
    const user = security.authenticatedUsers.from(req)
    db.reviews.update(
      { _id: req.body.id, author: user.data.email },
      { $set: { message: req.body.message } },
      { multi: true }
    ).then(
      result => {
        res.json(result)
      }, err => {
        res.status(500).json(err)
      })
  }
}