/*jslint node: true */

var frisby = require('frisby');

var URL = 'http://localhost:3000';

frisby.create('GET availability of https://github.com/bkimminich/juice-shop before executing redirect test')
    .get("https://github.com/bkimminich/juice-shop")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to https://github.com/bkimminich/juice-shop');
        } else {
            frisby.create('GET redirected to https://github.com/bkimminich/juice-shop when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=https://github.com/bkimminich/juice-shop")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of https://gratipay.com/juice-shop before executing redirect test')
    .get("https://gratipay.com/juice-shop")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to https://gratipay.com/juice-shop');
        } else {
            frisby.create('GET redirected to https://gratipay.com/juice-shop when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=https://gratipay.com/juice-shop")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN before executing redirect test')
    .get("https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN');
        } else {
            frisby.create('GET redirected to https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=https://blockchain.info/address/1FXJq5yVANLzR6ZWfqPKhJU3zWT3apnxmN")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub before executing redirect test')
    .get("http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub');
        } else {
            frisby.create('GET redirected to http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=http://flattr.com/thing/3856930/bkimminichjuice-shop-on-GitHub")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET error message with information leakage when calling /redirect without query parameter')
    .get(URL + "/redirect")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('TypeError')
    .expectBodyContains('&#39;indexOf&#39; of undefined')
    .toss();

frisby.create('GET error message with information leakage when calling /redirect with unrecognized query parameter')
    .get(URL + "/redirect?x=y")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('TypeError')
    .expectBodyContains('&#39;indexOf&#39; of undefined')
    .toss();

frisby.create('GET error message hinting at whitelist validation when calling /redirect with an unrecognized "to" target')
    .get(URL + "/redirect?to=whatever")
    .expectStatus(406)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<h1>Juice Shop (Express ~')
    .expectBodyContains('Unrecognized target URL for redirect: whatever')
    .toss();

frisby.create('GET redirected to target URL when https://github.com/bkimminich/juice-shop is part of the as "to" parameter')
    .get(URL + "/redirect?to=/score-board?satisfyIndexOf=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>Juice Shop</title>')
    .toss();