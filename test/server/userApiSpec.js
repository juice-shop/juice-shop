/*jslint node: true */

var frisby = require('frisby'),
    hash = require('../../lib/utils').hash;

var API_URL = 'http://localhost:3000/api';
var REST_URL = 'http://localhost:3000/rest';

frisby.create('GET all users')
    .get(API_URL + '/Users')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data.*', {
        id: Number,
        email: String,
        admin: Boolean,
        password: String,
        createdAt: String,
        updatedAt: String
    }).toss();

frisby.create('POST new user')
    .post(API_URL + '/Users', {
        email: 'horst@horstma.nn',
        admin: false,
        password: hash('hooooorst')
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    }).afterJSON(function (user) {
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
        frisby.create('GET existing user by id')
            .get(API_URL + '/Users/' + user.data.id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes('data', {
                id: Number,
                email: String,
                admin: Boolean,
                password: String,
                createdAt: String,
                updatedAt: String
            })
            .expectJSON('data', {
                id: user.data.id
            }).toss();
        frisby.create('PUT update existing user')
            .put(API_URL + '/Users/' + user.data.id, {
                admin: true
            })
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSON('data', {
                admin: true
            }).after(function () {
                frisby.create('DELETE existing user')
                    .delete(API_URL + '/Users/' + user.data.id)
                    .expectStatus(200)
                    .expectHeaderContains('content-type', 'application/json')
                    .after(function () {
                        frisby.create('GET non-existing user by id')
                            .get(API_URL + '/Users/' + user.data.id)
                            .expectStatus(200)
                            .expectHeaderContains('content-type', 'application/json')
                            .expectJSON('data', {})
                            .toss();
                    }).toss();
            }).toss();
    }).toss();

frisby.create('POST login non-existing user')
    .post(REST_URL + '/user/login', {
        email: 'otto@mei.er',
        password: 'ooootto'
    }, {json: true})
    .expectStatus(401)
    .toss();