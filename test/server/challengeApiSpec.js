/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new challenge')
    .post(API_URL + '/Challenges', {
        description: 'I am not a vulnerability!',
        link: 'http://invulnerab.le',
        solved: false
    })
    .expectStatus(401)
    .toss();

frisby.create('GET all challenges ')
    .get(API_URL + '/Challenges')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data.*', {
        id: Number,
        description: String,
        link: String,
        solved: Boolean
    })
    .toss();

frisby.create('GET existing challenge by id is forbidden via public API')
    .get(API_URL + '/Challenges/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing challenge is forbidden via public API')
    .put(API_URL + '/Challenges/1', {
        comment: "This sucks like nothing has ever sucked before",
        rating: 1
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing challenge is forbidden via public API')
    .delete(API_URL + '/Challenges/1')
    .expectStatus(401)
    .toss();

