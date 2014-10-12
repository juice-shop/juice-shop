/*jslint node: true */

var frisby = require('frisby'),
    insecurity = require('../../lib/insecurity');

var API_URL = 'http://localhost:3000/api';

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() } ;

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
    })
    .afterJSON(function(feedback) {
        frisby.create('GET existing feedback item by id')
            .addHeaders(authHeader)
            .get(API_URL + '/Feedbacks/' + feedback.data.id)
            .expectStatus(200)
            .afterJSON(function () {
                frisby.create('PUT update existing feedback')
                    .addHeaders(authHeader)
                    .put(API_URL + '/Feedbacks/' + feedback.data.id, {
                        rating: 2
                    })
                    .expectStatus(200)
                    .afterJSON(function () {
                        frisby.create('DELETE existing feedback')
                            .addHeaders(authHeader)
                            .delete(API_URL + '/Feedbacks/' + +feedback.data.id)
                            .expectStatus(200)
                            .toss();
                    }).toss();
            }).toss();
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

frisby.create('DELETE existing 5-start feedback')
    .delete(API_URL + '/Feedbacks/1')
    .addHeaders(authHeader)
    .expectStatus(200)
    .toss();

frisby.create('GET all feedback')
    .addHeaders(authHeader)
    .get(API_URL + '/Feedbacks')
    .expectStatus(200)
    .toss();
