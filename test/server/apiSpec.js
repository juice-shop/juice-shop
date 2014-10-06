/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';
var REST_URL = 'http://localhost:3000/rest';

frisby.create('GET all models declared in API')
    .get(API_URL)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data.*', {
        name: String,
        tableName: String
    })
    .expectJSON('data.?', {
        name: 'User',
        tableName: 'Users'
    })
    .expectJSON('data.?', {
        name: 'Feedback',
        tableName: 'Feedbacks'
    })
    .expectJSON('data.?', {
        name: 'Product',
        tableName: 'Products'
    })
    .expectJSON('data.?', {
        name: 'BasketItems',
        tableName: 'BasketItems'
    })
    .expectJSON('data.?', {
        name: 'Challenges',
        tableName: 'Challenges'
    })
    .toss();

frisby.create('GET error message with information leakage when calling unrecognized path with /rest in it')
    .get(REST_URL + "/unrecognized")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('Unexpected path: /rest/unrecognized')
    .toss();