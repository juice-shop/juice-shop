const frisby = require('frisby')
const config = require('config')

const API_URL = 'http://localhost:3000/api'
const REST_URL = 'http://localhost:3000/rest'

const jsonHeader = { 'content-type': 'application/json' }
let authHeader

describe('/api/Deliverys', () => {
  describe('for regular customer', () => {
    beforeAll(() => {
      return frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'jim@' + config.get('application.domain'),
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
    })

    it('GET delivery methods', () => {
      return frisby.get(API_URL + '/Deliverys', { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.length).toBe(3)
          expect(json.data[0].id).toBe(1)
          expect(json.data[0].name).toBe('One Day Delivery')
          expect(json.data[0].price).toBe(0.99)
          expect(json.data[0].eta).toBe(1)
        })
    })
  })

  describe('for deluxe customer', () => {
    beforeAll(() => {
      return frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'ciso@' + config.get('application.domain'),
          password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
    })

    it('GET delivery methods', () => {
      return frisby.get(API_URL + '/Deliverys', { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.length).toBe(3)
          expect(json.data[0].id).toBe(1)
          expect(json.data[0].name).toBe('One Day Delivery')
          expect(json.data[0].price).toBe(0.5)
          expect(json.data[0].eta).toBe(1)
        })
    })
  })
})

describe('/api/Deliverys/:id', () => {
  describe('for regular customer', () => {
    beforeAll(() => {
      return frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'jim@' + config.get('application.domain'),
          password: 'ncc-1701'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
    })

    it('GET delivery method', () => {
      return frisby.get(API_URL + '/Deliverys/2', { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.id).toBe(2)
          expect(json.data.name).toBe('Fast Delivery')
          expect(json.data.price).toBe(0.5)
          expect(json.data.eta).toBe(3)
        })
    })
  })

  describe('for deluxe customer', () => {
    beforeAll(() => {
      return frisby.post(REST_URL + '/user/login', {
        headers: jsonHeader,
        body: {
          email: 'ciso@' + config.get('application.domain'),
          password: 'mDLx?94T~1CfVfZMzw@sJ9f?s3L6lbMqE70FfI8^54jbNikY5fymx7c!YbJb'
        }
      })
        .expect('status', 200)
        .then(({ json }) => {
          authHeader = { Authorization: 'Bearer ' + json.authentication.token, 'content-type': 'application/json' }
        })
    })

    it('GET delivery method', () => {
      return frisby.get(API_URL + '/Deliverys/2', { headers: authHeader })
        .expect('status', 200)
        .expect('header', 'content-type', /application\/json/)
        .then(({ json }) => {
          expect(json.data.id).toBe(2)
          expect(json.data.name).toBe('Fast Delivery')
          expect(json.data.price).toBe(0)
          expect(json.data.eta).toBe(3)
        })
    })
  })
})
