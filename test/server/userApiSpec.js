/*jslint node: true */

var frisby = require('frisby'),
    hash = require('../../lib/utils').hash;

var API_URL = 'http://localhost:3000/api';
var REST_URL = 'http://localhost:3000/rest';

frisby.create('POST new user')
    .post(API_URL + '/Users', {
        email: 'horst@horstma.nn',
        admin: false,
        password: 'hooooorst'
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    })
    .expectJSON('data', {
        password: hash('hooooorst')
    })
    .afterJSON(function (user) {
        frisby.create('POST login existing user')
            .post(REST_URL + '/user/login', {
                email: 'horst@horstma.nn',
                password: 'hooooorst'
            }, {json: true})
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes({
                token: String
            }).toss();
    }).toss();

frisby.create('GET all users is forbidden via public API')
    .get(API_URL + '/Users')
    .expectStatus(401)
    .toss();

frisby.create('GET existing user by id is forbidden via public API')
    .get(API_URL + '/Users/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing user is forbidden via public API')
    .put(API_URL + '/Users/1', {
        admin: true
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing user is forbidden via public API')
    .delete(API_URL + '/Users/1')
    .expectStatus(401)
    .toss();

frisby.create('POST login non-existing user')
    .post(REST_URL + '/user/login', {
        email: 'otto@mei.er',
        password: 'ooootto'
    }, {json: true})
    .expectStatus(401)
    .toss();

frisby.create('POST login without credentials')
    .post(REST_URL + '/user/login', {
        email: undefined,
        password: undefined
    }, {json: true})
    .expectStatus(401)
    .toss();