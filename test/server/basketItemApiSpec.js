/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new basket item is not part of public API')
    .post(API_URL + '/BasketItems', {
        BasketId: 1,
        ProductId: 1,
        quantity: 1
    })
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('GET all basket item is not part of public API')
    .get(API_URL + '/BasketItems')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('GET existing basket item by id is not part of public API')
    .get(API_URL + '/BasketItems/1')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('PUT update basket item is not part of public API')
    .put(API_URL + '/BasketItems/1', {
        quantity: 2
    })
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

frisby.create('DELETE existing basket item is not part of public API')
    .delete(API_URL + '/BasketItems/1')
    .expectStatus(200)
    .expectJSON({status : 'error'})
    .toss();

