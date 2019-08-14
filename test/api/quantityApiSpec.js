const frisby = require('frisby')
const config = require('config')

const REST_URL = 'http://localhost:3000/rest'
const API_URL = 'http://localhost:3000/api'

const jsonHeader = { 'content-type': 'application/json' }

describe('/api/Quantitys', () => {
  it('GET quantity of all items for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('GET quantity of all items for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('GET quantity of all items for accounting users', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('POST quantity is forbidden for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.post(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            ProductId: 1,
            quantity: 100
          }
        })
          .expect('status', 401)
      })
  })

  it('POST quantity forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.post(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            ProductId: 1,
            quantity: 100
          }
        })
          .expect('status', 401)
      })
  })

  it('POST quantity is forbidden for accounting users', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.post(API_URL + '/Quantitys', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            ProductId: 1,
            quantity: 100
          }
        })
          .expect('status', 401)
      })
  })
})

describe('/api/Quantitys/:ids', () => {
  it('GET quantity of all items is forbidden for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 403)
          .expect('json', 'error', 'Malicious activity detected')
      })
  })

  it('GET quantity of all items is forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 403)
          .expect('json', 'error', 'Malicious activity detected')
      })
  })

  it('GET quantity of all items for accounting users', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.get(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 200)
      })
  })

  it('PUT quantity is forbidden for customers', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            quantity: 100
          }
        })
          .expect('status', 403)
          .expect('json', 'error', 'Malicious activity detected')
      })
  })

  it('PUT quantity is forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            quantity: 100
          }
        })
          .expect('status', 403)
          .expect('json', 'error', 'Malicious activity detected')
      })
  })

  it('PUT quantity as accounting user', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.put(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' },
          body: {
            quantity: 100
          }
        })
          .expect('status', 200)
          .then(({ json }) => {
            expect(json.data.quantity).toBe(100)
          })
      })
  })

  it('DELETE quantity is forbidden for accountant', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'accountant@' + config.get('application.domain'),
        password: 'i am an awesome accountant'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.delete(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 401)
      })
  })

  it('DELETE quantity is forbidden for admin', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'admin@' + config.get('application.domain'),
        password: 'admin123'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.delete(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 401)
      })
  })

  it('DELETE quantity is forbidden for users', () => {
    return frisby.post(REST_URL + '/user/login', {
      headers: jsonHeader,
      body: {
        email: 'jim@' + config.get('application.domain'),
        password: 'ncc-1701'
      }
    })
      .expect('status', 200)
      .then(({ json }) => {
        return frisby.delete(API_URL + '/Quantitys/1', {
          headers: { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
          .expect('status', 401)
      })
  })
})
