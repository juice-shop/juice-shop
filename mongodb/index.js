var minimongo = require('minimongo')

var LocalDb = minimongo.MemoryDb

var db = new LocalDb()
db.addCollection('reviews')

module.exports = db
