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

frisby.create('GET error message with information leakage when calling /redirect without query parameter')
    .get(API_URL + "/redirect")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Connect')
    .expectBodyContains('TypeError: Cannot call method')
    .expectBodyContains('indexOf')
    .toss();

frisby.create('GET error message with information leakage when calling /redirect with unrecognized query parameter')
    .get(API_URL + "/redirect?x=y")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('TypeError: Cannot call method &#39;indexOf&#39; of undefined')
    .toss();

frisby.create('GET redirected to https://github.com/bkimminich/juice-shop when this URL is passed as "to" parameter')
    .get(API_URL + "/redirect?to=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>bkimminich/juice-shop · GitHub</title>')
    .toss();

frisby.create('GET redirected to https://github.com/bkimminich/juice-shop when anything is passed as "to" parameter')
    .get(API_URL + "/redirect?to=whatever")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>bkimminich/juice-shop · GitHub</title>')
    .toss();

frisby.create('GET redirected to target URL when https://github.com/bkimminich/juice-shop is part of the as "to" parameter')
    .get(API_URL + "/redirect?to=http://kimminich.de?satisfyIndexOf=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>Björn Kimminich&#039;s Blog | Stuff like Clean Code, Software Craftsmanship and Application Security</title>')
    .toss();