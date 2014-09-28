/*jslint node: true */

var frisby = require('frisby');

var URL = 'http://localhost:3000/rest';

/* User Login */
frisby.create('POST login non-existing user')
    .post(URL + '/user/login', {
        email: 'otto@mei.er',
        password: 'ooootto'
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON('data', {})
    .toss();

frisby.create('POST new user via API')
    .post('http://localhost:3000/api/Users', {
        email: 'horst@horstma.nn',
        admin: false,
        password: 'hooooorst'
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .afterJSON(function (user) {
        frisby.create('POST login existing user')
            .post(URL + '/user/login', {
                email: user.data.email,
                password: user.data.password
            }, {json: true})
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSON('data', {
                id: user.data.id,
                email: user.data.email,
                password: user.data.password
            })
            .toss();
        frisby.create('DELETE existing user')
            .delete('http://localhost:3000/api/Users/' + user.data.id)
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json').toss();
    })
    .toss();

/* Product Search*/
frisby.create('GET product search with no matches returns no products')
    .get(URL + '/product/search?q=nomatcheswhatsoever')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 0)
    .toss();

frisby.create('GET product search with one match returns found product')
    .get(URL + '/product/search?q=apple')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 1)
    .toss();

frisby.create('GET product search with empty search parameter returns all products')
    .get(URL + '/product/search?q=')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 5) // test data defines 4 only, but async apiSpec.js creates +1 parallel to this test
    .toss();

frisby.create('GET product search without search parameter returns all products')
    .get(URL + '/product/search')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONLength('data', 5) // test data defines 4 only, but async apiSpec.js creates +1 parallel to this test
    .toss();



