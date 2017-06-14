var frisby = require('frisby')
var utils = require('../../lib/utils')

var REST_URL = 'http://localhost:3000/rest/admin'

frisby.create('GET application version from package.json')
  .get(REST_URL + '/application-version')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    version: utils.version()
  })
  .toss()
