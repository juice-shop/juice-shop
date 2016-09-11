/* jslint node: true */

var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')

var API_URL = 'http://localhost:3000/api'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

frisby.create('POST new complaint')
    .addHeaders(authHeader)
    .post(API_URL + '/Complaints', {
      message: 'My stuff never arrived! This is outrageous'
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
      id: Number,
      createdAt: String,
      updatedAt: String
    }).toss()
