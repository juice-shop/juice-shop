var Review = require('./reviews').Review
var Secret = require('./secrets').Secret

module.exports = function datacreator () {
  Review.remove().then(function () {
    console.log('Emptied the review collection (NoSql Database)')
  }, function () {
    console.log('Error while trying to empty the review collection (NoSql Database)')
  })

  Secret.remove().then(function () {
    console.log('Emptied the secret collection (NoSql Database)')
  }, function () {
    console.log('Error while trying to empty the review collection (NoSql Database)')
  })

  // resetting the counter which is detemening the models id on each startup
  Review.resetCount(function (err, count) {
    if (err) {
      console.log(err)
    } else {
      console.log('Reseted the counter for the review collection')
    }
  })

  new Review({ product: 1, message: 'One of my favorites!', author: 'admin@juice-sh.op' }).save()
  new Review({ product: 17, message: 'Has a nice flavor!', author: 'bender@juice-sh.op' }).save()
  new Review({ product: 3, message: 'I bought it, would buy again. 5/7', author: 'jim@juice-sh.op' }).save()
  new Review({ product: 14, message: 'Fresh out of a replicator.', author: 'jim@juice-sh.op' }).save()
  new Review({ product: 6, message: 'Fry liked it too.', author: 'bender@juice-sh.op' }).save()
  new Review({ product: 19, message: 'A vital ingredient for a succesful playthrough.', author: 'jim@juice-sh.op' }).save()

  new Secret({ message: 'This is a totaly safe place to store data because no user could possibly access it.' }).save()
}
