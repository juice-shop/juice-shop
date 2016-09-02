/*jslint node: true */

var frisby = require('frisby');

var URL = 'http://localhost:3000';

frisby.create('GET response must contain CORS header allowing all origins')
    .get(URL + "/dist/juice-shop.min.js")
    .expectStatus(200)
    .expectHeaderContains('Access-Control-Allow-Origin', '*')
    .toss();