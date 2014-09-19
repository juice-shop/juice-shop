var frisby = require('frisby');

var URL = 'http://localhost:3000/api';

/* General REST API Test */
frisby.create('GET all models declared in API')
    .get(URL)
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
        name: 'Basket',
        tableName: 'Baskets'
    })
    .expectJSON('data.?', {
        name: 'BasketItems',
        tableName: 'BasketItems'
    })
    .expectJSON('data.?', {
        name: 'Product',
        tableName: 'Products'
    }).toss();

/* User Tests */
frisby.create('GET all users')
    .get(URL + '/Users')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data.*', {
        id: Number,
        name: String,
        email: String,
        admin: Boolean,
        password: String,
        createdAt: String,
        updatedAt: String
    }).toss();

frisby.create('POST new user')
    .post(URL + '/Users', {
        name: 'Horst Horstmann',
        email: 'horst@horstma.nn',
        admin: false,
        password: 'sha1$123'
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    }).afterJSON(function (user) {
        frisby.create('GET existing user by id')
            .get(URL + '/Users/' + user.data.id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes('data', {
                id: Number,
                name: String,
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
            .put(URL + '/Users/' + user.data.id, {
                password: 'sha1$abc123'
            })
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSON('data', {
                password: 'sha1$abc123'
            }).toss();
        frisby.create('DELETE existing user')
            .delete(URL + '/Users/' + user.data.id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json').toss();
        frisby.create('GET non-existing user by id')
            .get(URL + '/Users/' + user.data.id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSON('data', {})
            .toss();
    })
    .toss();