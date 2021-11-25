module.exports = function productReviews () {
  return (req, res, next) => {
    const user = security.authenticatedUsers.from(req)

    if (typeof req.body.id !== 'string') {
      res.status(400).send()
      return
    }

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
