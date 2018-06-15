const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const insecurity = require('../lib/insecurity')
const sleep = require('sleep')

module.exports = function productReviews () {
  return (req, res, next) => {
    const id = req.body.id
    const user = insecurity.authenticatedUsers.from(req)
    console.log(id)
    db.reviews.findOne({ _id: id }).then(review => {
      var likedBy = review.likedBy
      if(!likedBy.includes(user.data.email)){
        db.reviews.update(
          { _id: id },
          { '$inc': { likesCount: 1 } }
        ).then(
          result => {
            // Artificial wait for timing attack challenge
            sleep.msleep(15000) 
            var count = 0
            for (var i = 0;i<likedBy.length;i++){
              if(likedBy[i]===user.data.email){
                count++;
              }
            }
            if(count > 1 && utils.notSolved(challenges.timingAttackChallenge)){
              utils.solve(challenges.timingAttackChallenge)
            }
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
