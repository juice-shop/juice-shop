/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000/api';

frisby.create('POST new basket item is forbidden via public API')
    .post(API_URL + '/BasketItems', {
        BasketId: 1,
        ProductId: 1,
        quantity: 1
    })
    .expectStatus(401)
    .toss();

frisby.create('GET all basket item is forbidden via public API')
    .get(API_URL + '/BasketItems')
    .expectStatus(401)
    .toss();

frisby.create('GET existing basket item by id is forbidden via public API')
    .get(API_URL + '/BasketItems/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update basket item feedback is forbidden via public API')
    .put(API_URL + '/BasketItems/1', {
        quantity: 2
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing basket item is forbidden via public API')
    .delete(API_URL + '/BasketItems/1')
    .expectStatus(401)
    .toss();

