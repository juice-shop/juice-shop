const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const insecurity = require('../lib/insecurity')
const sleep = require('sleep')

module.exports = function productReviews () {
  return (req, res, next) => {
    const id = req.body.id
    const user = insecurity.authenticatedUsers.from(req)

    db.reviews.findOne({ _id: id }).then(review => {
      var likedBy = review.likedBy
      if(!likedBy.includes(user.data.email)){
        db.reviews.update(
          { _id: id },
          { '$inc': { likesCount: 1 } }
        ).then(
          result => {
            // Artificial wait for timing attack challenge
            sleep.msleep(800) 
            likedBy.push(user.data.email)
            db.reviews.update(
              { _id: id },
              { '$set': { likedBy: likedBy } }
            ).then(
              result => {
                res.json(result)
              }, err => {
                res.status(500).json(err)
              })
          }, err => {
            res.status(500).json(err)
          })
      }else{
        res.status(403).json({ error: 'Not allowed' })
      }
    }, () => {
      res.status(400).json({ error: 'Wrong Params' })
    })
  }
}
