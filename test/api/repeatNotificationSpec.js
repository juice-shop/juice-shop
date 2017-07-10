var frisby = require('frisby')

var REST_URL = 'http://localhost:3000/rest'

frisby.create('GET repeat notification without passing a challenge')
  .get(REST_URL + '/repeat-notification')
  .expectStatus(200)
  .toss()

frisby.create('GET repeat notification passing an unsolved challenge')
  .get(REST_URL + '/repeat-notification?challenge=Retrieve%20Blueprint')
  .expectStatus(200)
  .toss()

frisby.create('GET repeat notification passing a solved challenge')
  .get(REST_URL + '/repeat-notification?challenge=Error%20Handling')
  .expectStatus(200)
  .toss()
