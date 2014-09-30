/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new basket is forbidden via public API')
    .post(API_URL + '/Baskets', {
        UserId: 1
    })
    .expectStatus(401)
    .toss();

frisby.create('GET all basket is forbidden via public API')
    .get(API_URL + '/Baskets')
    .expectStatus(401)
    .toss();

frisby.create('GET existing basket by id is forbidden via public API')
    .get(API_URL + '/Baskets/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing basket is forbidden via public API')
    .put(API_URL + '/Baskets/1', {
        UserId: 2
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing basket is forbidden via public API')
    .delete(API_URL + '/Baskets/1')
    .expectStatus(401)
    .toss();

