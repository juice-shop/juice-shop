var frisby = require('frisby')
var fs = require('fs')
var path = require('path')
var FormData = require('form-data')

var URL = 'http://localhost:3000'

var invalidSizeForClient = path.resolve(__dirname, '../files/invalidSizeForClient.pdf')
var validSizeForServerForm = new FormData()
validSizeForServerForm.append('file', fs.createReadStream(invalidSizeForClient), {
  knownLength: fs.statSync(invalidSizeForClient).size
})

frisby.create('POST file too large for client validation but valid for API')
  .post(URL + '/file-upload',
    validSizeForServerForm,
  {
    json: false,
    headers: {
      'content-type': 'multipart/form-data; boundary=' + validSizeForServerForm.getBoundary(),
      'content-length': validSizeForServerForm.getLengthSync()
    }
  })
  .expectStatus(204)
  .toss()

var invalidTypeForClient = path.resolve(__dirname, '../files/invalidTypeForClient.exe')
var validTypeForServerForm = new FormData()
validTypeForServerForm.append('file', fs.createReadStream(invalidTypeForClient), {
  knownLength: fs.statSync(invalidTypeForClient).size
})

frisby.create('POST file with illegal type for client validation but valid for API')
  .post(URL + '/file-upload',
    validTypeForServerForm,
  {
    json: false,
    headers: {
      'content-type': 'multipart/form-data; boundary=' + validTypeForServerForm.getBoundary(),
      'content-length': validTypeForServerForm.getLengthSync()
    }
  })
  .expectStatus(204)
  .toss()

var invalidSizeForServer = path.resolve(__dirname, '../files/invalidSizeForServer.pdf')
var invalidSizeForServerForm = new FormData()
invalidSizeForServerForm.append('file', fs.createReadStream(invalidSizeForServer), {
  knownLength: fs.statSync(invalidSizeForServer).size
})

frisby.create('POST file too large for API')
  .post(URL + '/file-upload',
    invalidSizeForServerForm,
  {
    json: false,
    headers: {
      'content-type': 'multipart/form-data; boundary=' + invalidSizeForServerForm.getBoundary(),
      'content-length': invalidSizeForServerForm.getLengthSync()
    }
  })
  .expectStatus(500)
  .toss()
