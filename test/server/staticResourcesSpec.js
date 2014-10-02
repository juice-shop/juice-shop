/*jslint node: true */

var frisby = require('frisby');

var URL = 'http://localhost:3000';

frisby.create('GET index.html when visiting application URL')
    .get(URL)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Juice Shop')
    .toss();

frisby.create('GET index.html when visiting application URL with any path')
    .get(URL + "/whatever")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Juice Shop')
    .toss();

frisby.create('GET error message with information leakage when calling /redirect without query parameter')
    .get(URL + "/redirect")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Connect')
    .expectBodyContains('TypeError: Cannot call method')
    .expectBodyContains('indexOf')
    .toss();

frisby.create('GET error message with information leakage when calling /redirect with unrecognized query parameter')
    .get(URL + "/redirect?x=y")
    .expectStatus(500)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('TypeError: Cannot call method &#39;indexOf&#39; of undefined')
    .toss();

frisby.create('GET redirected to https://github.com/bkimminich/juice-shop when this URL is passed as "to" parameter')
    .get(URL + "/redirect?to=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>bkimminich/juice-shop · GitHub</title>')
    .toss();

frisby.create('GET redirected to https://github.com/bkimminich/juice-shop when anything is passed as "to" parameter')
    .get(URL + "/redirect?to=whatever")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>bkimminich/juice-shop · GitHub</title>')
    .toss();

frisby.create('GET redirected to target URL when https://github.com/bkimminich/juice-shop is part of the as "to" parameter')
    .get(URL + "/redirect?to=http://kimminich.de?satisfyIndexOf=https://github.com/bkimminich/juice-shop")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>Björn Kimminich&#039;s Blog | Stuff like Clean Code, Software Craftsmanship and Application Security</title>')
    .toss();

frisby.create('GET /public/ftp serves a directory listing')
    .get(URL + "/public/ftp")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('<title>listing directory /public/ftp</title>')
    .toss();

frisby.create('GET a non-existing Markdown file in /public/ftp will return a 404 error')
    .get(URL + "/public/ftp/doesnotexist.md")
    .expectStatus(404)
    .toss();

frisby.create('GET a non-existing text file in /public/ftp will return a 404 error')
    .get(URL + "/public/ftp/doesnotexist.txt")
    .expectStatus(404)
    .toss();

frisby.create('GET a non-existing file in /public/ftp will return a 403 error for invalid file type')
    .get(URL + "/public/ftp/doesnotexist.exe")
    .expectStatus(403)
    .toss();

frisby.create('GET an existing file in /public/ftp will return a 403 error for invalid file type')
    .get(URL + "/public/ftp/eastere.gg")
    .expectStatus(403)
    .toss();

frisby.create('GET the easter egg file by using an encoded Poison Null Byte attack with .txt suffix')
    .get(URL + "/public/ftp/eastere.gg%2500.txt")
    .expectStatus(200)
    .toss();

frisby.create('GET the easter egg file by using an encoded Poison Null Byte attack with .md suffix')
    .get(URL + "/public/ftp/eastere.gg%2500.md")
    .expectStatus(200)
    .toss();

frisby.create('GET the second easter egg by visiting the hidden URL')
    .get(URL + "/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg")
    .expectStatus(200)
    .expectHeaderContains('content-type', 'text/html')
    .expectBodyContains('Nothing here yet! You still receive the Level-2-Easter-Egg-Badge! Congratulations!')
    .toss();