module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)

    if (req.body.id['$ne'] !== undefined) {
      res.status(400).send()
      return
    }

    db.reviewsCollection.update(
      { _id: req.body.id },
      { $set: { message: req.body.message } }
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        res.json(result)
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}