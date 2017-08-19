var mongoose = require('mongoose')
var autoIncrement = require('mongoose-auto-increment')

var ReviewSchema = new mongoose.Schema({
  product: Number,
  message: String,
  author: String
}, {safe: false})

ReviewSchema.plugin(autoIncrement.plugin, 'Review')

var Review = mongoose.model('Review', ReviewSchema)

module.exports = {
  Review: Review
}
