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

frisby.create('GET availability of http://shop.spreadshirt.com/juiceshop before executing redirect test')
    .get("http://shop.spreadshirt.com/juiceshop")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to http://shop.spreadshirt.com/juiceshop');
        } else {
            frisby.create('GET redirected to http://shop.spreadshirt.com/juiceshop when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=http://shop.spreadshirt.com/juiceshop")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of http://shop.spreadshirt.de/juiceshop before executing redirect test')
    .get("http://shop.spreadshirt.de/juiceshop")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to http://shop.spreadshirt.de/juiceshop');
        } else {
            frisby.create('GET redirected to http://shop.spreadshirt.de/juiceshop when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=http://shop.spreadshirt.de/juiceshop")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of https://www.stickermule.com/user/1070702817/stickers before executing redirect test')
    .get("https://www.stickermule.com/user/1070702817/stickers")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to https://www.stickermule.com/user/1070702817/stickers');
        } else {
            frisby.create('GET redirected to https://www.stickermule.com/user/1070702817/stickers when this URL is passed as "to" parameter')
                .get(URL + "/redirect?to=https://www.stickermule.com/user/1070702817/stickers")
                .expectStatus(res.statusCode)
                .toss();
        }
    }).toss();

frisby.create('GET availability of https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=US&item_name=Juice%20Shop&no_note=0&currency_code=USD&bn=PP%2dDonationsBF before executing redirect test')
    .get("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=US&item_name=Juice%20Shop&no_note=0&currency_code=USD&bn=PP%2dDonationsBF")
    .after(function (err, res) {
        if (err != null) {
            console.log('Problem with HTTP connection (' + err + '). Skipping redirect test to https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=US&item_name=Juice%20Shop&no_note=0&currency_code=USD&bn=PP%2dDonationsBF');
        } else {
            frisby.create('GET redirected to https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40owasp%2eorg&lc=US&item_name=Juice%20Shop&no_note=0&currency_code=USD&bn=PP%2dDonationsBF when this URL is passed as URL-encoded "to" parameter')
                .get(URL + "/redirect?to=https%3A%2F%2Fwww.paypal.com%2Fcgi-bin%2Fwebscr%3Fcmd%3D_donations%26business%3Dpaypal%2540owasp%252eorg%26lc%3DUS%26item_name%3DJuice%2520Shop%26no_note%3D0%26currency_code%3DUSD%26bn%3DPP%252dDonationsBF")
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

frisby.create('GET redirected to target URL in "to" parameter when a white-listed URL is part of the query string')
    .get(URL + "/redirect?to=/score-board?satisfyIndexOf=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>OWASP Juice Shop</title>')
    .toss();