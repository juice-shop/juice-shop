/*jslint node: true */

var frisby = require('frisby'),
    insecurity = require('../../lib/insecurity');

var API_URL = 'http://localhost:3000/api';
var REST_URL = 'http://localhost:3000/rest';

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() } ;

frisby.create('POST new user')
    .post(API_URL + '/Users', {
        email: 'horst@horstma.nn',
        admin: false,
        password: 'hooooorst'
    })
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes('data', {
        id: Number,
        createdAt: String,
        updatedAt: String
    })
    .expectJSON('data', {
        password: insecurity.hash('hooooorst')
    })
    .afterJSON(function (user) {
        frisby.create('POST login existing user')
            .post(REST_URL + '/user/login', {
                email: 'horst@horstma.nn',
                password: 'hooooorst'
            }, {json: true})
            .expectStatus(200)
            .expectHeaderContains('content-type', 'application/json')
            .expectJSONTypes({
                token: String
            })
            .afterJSON(function(auth) {
                frisby.create('GET password change with recognized authorization token')
                    .get(REST_URL + '/user/change-password?new=foo&repeat=foo')
                    .addHeaders({ 'Authorization': 'Bearer ' + auth.token })
                    .expectStatus(200)
                    .toss();
    }).toss();

        frisby.create('GET existing user by id')
            .addHeaders(authHeader)
            .get(API_URL + '/Users/' + user.data.id)
            .expectStatus(200)
            .after(function() {
                frisby.create('PUT update existing user')
                    .addHeaders(authHeader)
                    .put(API_URL + '/Users/' + user.data.id, {
                        email: 'horst.horstmann@horstma.nn'
                    })
                    .expectStatus(200)
                    .after(function() {
                        frisby.create('DELETE existing user is forbidden via API even when authenticated')
                            .addHeaders(authHeader)
                            .delete(API_URL + '/Users/' + + user.data.id)
                            .expectStatus(401)
                            .toss();
                    }).toss();
            }).toss();
    }).toss();


frisby.create('GET all users is forbidden via public API')
    .get(API_URL + '/Users')
    .expectStatus(401)
    .toss();

frisby.create('GET existing user by id is forbidden via public API')
    .get(API_URL + '/Users/1')
    .expectStatus(401)
    .toss();

frisby.create('PUT update existing user is forbidden via public API')
    .put(API_URL + '/Users/1', {
        admin: true
    })
    .expectStatus(401)
    .toss();

frisby.create('DELETE existing user is forbidden via public API')
    .delete(API_URL + '/Users/1')
    .expectStatus(401)
    .toss();

frisby.create('POST login non-existing user')
    .post(REST_URL + '/user/login', {
        email: 'otto@mei.er',
        password: 'ooootto'
    }, {json: true})
    .expectStatus(401)
    .toss();

frisby.create('POST login without credentials')
    .post(REST_URL + '/user/login', {
        email: undefined,
        password: undefined
    }, {json: true})
    .expectStatus(401)
    .toss();

frisby.create('POST login with admin credentials')
    .post(REST_URL + '/user/login', {
        email: 'admin@juice-sh.op',
        password: 'admin123'
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        token: String
    })
    .toss();

frisby.create('POST login with WHERE-clause disabling SQL injection attack')
    .post(REST_URL + '/user/login', {
        email: '\' or 1=1--',
        password: undefined
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        token: String
    })
    .toss();

frisby.create('POST login with known email "admin@juice-sh.op" in SQL injection attack')
    .post(REST_URL + '/user/login', {
        email: 'admin@juice-sh.op\'--',
        password: undefined
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        token: String
    })
    .toss();

frisby.create('POST login with known email "jim@juice-sh.op" in SQL injection attack')
    .post(REST_URL + '/user/login', {
        email: 'jim@juice-sh.op\'--',
        password: undefined
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        token: String
    })
    .toss();

frisby.create('POST login with known email "bender@juice-sh.op" in SQL injection attack')
    .post(REST_URL + '/user/login', {
        email: 'bender@juice-sh.op\'--',
        password: undefined
    }, {json: true})
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        token: String
    })
    .toss();

frisby.create('POST login with query-breaking SQL Injection attack')
    .post(REST_URL + '/user/login', {
        email: '\';',
        password: undefined
    }, {json: true})
    .expectStatus(401)
    .toss();

frisby.create('GET password change without passing any passwords')
    .get(REST_URL + '/user/change-password')
    .expectStatus(401)
    .expectBodyContains('Password cannot be empty')
    .toss();

frisby.create('GET password change with passing wrong repeated password')
    .get(REST_URL + '/user/change-password?new=foo&repeat=bar')
    .expectStatus(401)
    .expectBodyContains('New and repeated password do not match')
    .toss();

frisby.create('GET password change without passing an authorization token')
    .get(REST_URL + '/user/change-password?new=foo&repeat=foo')
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('TypeError: Cannot call method &#39;split&#39; of undefined')
    .toss();

frisby.create('GET password change with passing unrecognized authorization token')
    .get(REST_URL + '/user/change-password?new=foo&repeat=foo')
    .addHeaders(authHeader)
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('Error: Blocked illegal activity')
    .toss();

frisby.create('GET all users')
    .addHeaders(authHeader)
    .get(API_URL + '/Users')
    .expectStatus(200)
    .toss();