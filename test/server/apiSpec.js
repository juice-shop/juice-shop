/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

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
    }).toss();