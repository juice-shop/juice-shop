/*jslint node: true */

var frisby = require('frisby'),
    insecurity = require('../../lib/insecurity');

var API_URL = 'http://localhost:3000/api';
var REST_URL = 'http://localhost:3000/rest';

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() } ;

frisby.create('GET existing user by id')
    .get(API_URL + '/Products/1')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        name: String,
        description: String,
        price: Number,
        image: String,
        createdAt: String,
        updatedAt: String
    })
    .expectJSON('data', {
        id: 1
    })
    .toss();

frisby.create('GET non-existing product by id')
    .get(API_URL + '/Products/4711')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON('data', {})
    .toss();

frisby.create('GET product search with no matches returns no products')
    .get(REST_URL + '/product/search?q=nomatcheswhatsoever')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 0)
    .toss();

frisby.create('GET product search with one match returns found product')
    .get(REST_URL + '/product/search?q=apple')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 1)
    .toss();

frisby.create('GET product search with XSS attack is not blocked')
    .get(REST_URL + '/product/search?q=<script>alert("XSS1")</script>')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .toss();

frisby.create('POST new product is forbidden via public API')
    .post(API_URL + '/Products', {
        name: 'Dirt Juice (1000ml)',
        description: "Made from ugly dirt.",
        price: 0.99,
        image: 'dirt_juice.jpg'
    })
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing product is possible due to Missing Function-Level Access Control vulnerability')
    .put(API_URL + '/Products/9', {
        description: "<a href=\"http://kimminich.de\" target=\"_blank\">"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON('data', {
        description: "<a href=\"http://kimminich.de\" target=\"_blank\">"
    })
    .toss();

frisby.create('PUT update existing product does not filter XSS attacks')
    .put(API_URL + '/Products/8', {
        description: "<script>alert(\'XSS4\')</script>"
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON('data', {
        description: "<script>alert(\'XSS4\')</script>"
    })
    .toss();

frisby.create('DELETE existing product is forbidden via public API')
    .delete(API_URL + '/Products/1')
    .expectStatus(401)
    .toss();

frisby.create('POST new product')
    .addHeaders(authHeader)
    .post(API_URL + '/Products', {
        name: 'Dirt Juice (1000ml)',
        description: "Made from ugly dirt.",
        price: 0.99,
        image: 'dirt_juice.jpg'
    })
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    })
    .afterJSON(function(product) {
        frisby.create('GET existing product item by id')
            .addHeaders(authHeader)
            .get(API_URL + '/Products/' + product.data.id)
            .expectStatus(200)
            .afterJSON(function () {
                frisby.create('DELETE existing product is forbidden via API even when authenticated')
                    .addHeaders(authHeader)
                    .delete(API_URL + '/Products/' + +product.data.id)
                    .expectStatus(401)
                    .after(function() {
                        frisby.create('GET all products')
                            .get(API_URL + '/Products')
                            .expectStatus(200)
                            .expectHeaderContains('content-type', 'application/json')
                            .expectJSONTypes('data.*', {
                                id: Number,
                                name: String,
                                description: String,
                                price: Number,
                                image: String
                            })
                            .afterJSON(function (products) {
                                frisby.create('GET product search with empty search parameter returns all products')
                                    .get(REST_URL + '/product/search?q=')
                                    .expectStatus(200)
                                    .expectHeaderContains('content-type', 'application/json')
                                    .expectJSONLength('data', products.data.length)
                                    .toss();
                                frisby.create('GET product search without search parameter returns all products')
                                    .get(REST_URL + '/product/search')
                                    .expectStatus(200)
                                    .expectHeaderContains('content-type', 'application/json')
                                    .expectJSONLength('data', products.data.length)
                                    .toss();
                            }).toss();
                    }).toss();
            }).toss();
    }).toss();

frisby.create('POST new product does not filter XSS attacks')
    .addHeaders(authHeader)
    .post(API_URL + '/Products', {
        name: 'XSS Juice (42ml)',
        description: "<script>alert(\'XSS4\')</script>",
        price: 9999.99,
        image: 'xss_juice.jpg'
    })
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON('data', {
        description: "<script>alert(\'XSS4\')</script>"
    }).toss();

