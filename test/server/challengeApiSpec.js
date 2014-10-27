/*jslint node: true */

var frisby = require('frisby'),
    insecurity = require('../../lib/insecurity');

var API_URL = 'http://localhost:3000/api';

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() } ;

frisby.create('GET all challenges ')
    .get(API_URL + '/Challenges')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data.*', {
        id: Number,
        name: String,
        description: String,
        solved: Boolean
    })
    .toss();

frisby.create('GET existing challenge by id is forbidden via public API even when authenticated')
    .addHeaders(authHeader)
    .get(API_URL + '/Challenges/1')
    .expectStatus(401)
    .toss();

frisby.create('POST new challenge is forbidden via public API even when authenticated')
    .addHeaders(authHeader)
    .post(API_URL + '/Challenges', {
        name: 'Invulnerability',
        description: 'I am not a vulnerability!',
        solved: false
    })
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing challenge is forbidden via public API even when authenticated')
    .addHeaders(authHeader)
    .put(API_URL + '/Challenges/1', {
        name: 'Vulnerability',
        description: "I am a vulnerability!!!",
        rating: 1
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing challenge is forbidden via public API even when authenticated')
    .addHeaders(authHeader)
    .delete(API_URL + '/Challenges/1')
    .expectStatus(401)
    .toss();

