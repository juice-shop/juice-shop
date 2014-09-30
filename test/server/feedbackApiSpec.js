/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new feedback')
    .post(API_URL + '/Feedbacks', {
        comment: 'Perfect!',
        rating: 5
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    }).toss();

frisby.create('GET all feedback is forbidden via public API')
    .get(API_URL + '/Feedbacks')
    .expectStatus(401)
    .toss();

frisby.create('GET existing feedback by id is forbidden via public API')
    .get(API_URL + '/Feedbacks/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing feedback is forbidden via public API')
    .put(API_URL + '/Feedbacks/1', {
        comment: "This sucks like nothing has ever sucked before",
        rating: 1
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing feedback is forbidden via public API')
    .delete(API_URL + '/Feedbacks/1')
    .expectStatus(401)
    .toss();

