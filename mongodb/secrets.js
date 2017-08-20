var mongoose = require('mongoose')

var SecretSchema = new mongoose.Schema({
  message: String
})

var Secret = mongoose.model('Secret', SecretSchema)

module.exports = {
  Secret: Secret
}
