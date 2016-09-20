var frisby = require('frisby')

var URL = 'http://localhost:3000'

frisby.create('GET response must contain CORS header allowing all origins')
  .get(URL)
  .expectStatus(200)
  .expectHeaderContains('Access-Control-Allow-Origin', '*')
  .toss()

frisby.create('GET response must contain sameorigin frameguard header')
  .get(URL)
  .expectStatus(200)
  .expectHeaderContains('X-Frame-Options', 'sameorigin')
  .toss()

frisby.create('GET response must contain nosniff content type header')
  .get(URL)
  .expectStatus(200)
  .expectHeaderContains('X-Content-Type-Options', 'nosniff')
  .toss()
