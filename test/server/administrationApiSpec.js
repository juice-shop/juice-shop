var frisby = require('frisby')
var utils = require('../../lib/utils')

var REST_URL = 'http://localhost:3000/rest/admin'

describe('/rest/admin', function () {
  it('should GET application version from package.json', function (done) {
    frisby.get(REST_URL + '/application-version')
      .expect('status', 200)
      .expect('header', 'content-type', 'application/json')
      .expect('json', {
        version: utils.version()
      })
      .done(done)
  })
})
