/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new basket is not part of public API')
    .post(API_URL + '/Baskets', {
        UserId: 1
    })
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('GET all baskets is not part of public API')
    .get(API_URL + '/Baskets')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('GET existing basket is not part of public API')
    .get(API_URL + '/Baskets/1')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('PUT update existing basket is not part of public API')
    .put(API_URL + '/Baskets/1', {
        UserId: 2
    })
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('DELETE existing basket is not part of public API')
    .delete(API_URL + '/Baskets/1')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

