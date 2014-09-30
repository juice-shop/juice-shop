/*jslint node: true */

var frisby = require('frisby');

var API_URL = 'http://localhost:3000';

frisby.create('GET index.html when visiting application URL')
    .get(API_URL)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Juice Shop')
    .toss();

frisby.create('GET index.html when visiting application URL with any path')
    .get(API_URL + "/whatever")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Juice Shop')
    .toss();