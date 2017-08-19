var db = require('./index')

var reviews = [
  { product: 1, message: 'One of my favorites!', author: 'admin@juice-sh.op' },
  { product: 17, message: 'Has a nice flavor!', author: 'bender@juice-sh.op' },
  { product: 3, message: 'I bought it, would buy again. 5/7', author: 'jim@juice-sh.op' },
  { product: 14, message: 'Fresh out of a replicator.', author: 'jim@juice-sh.op' },
  { product: 6, message: 'Fry liked it too.', author: 'bender@juice-sh.op' },
  { product: 19, message: 'A vital ingredient for a succesful playthrough.', author: 'jim@juice-sh.op' }
]

module.exports = function datacreator () {
  db.reviews.upsert(reviews, {}, function (reviews) {
    console.log('Created some reviews!')
    console.log('Reviews', reviews)
  })
}
