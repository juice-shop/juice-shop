const frisby = require('frisby')

const REST_URL = 'http://localhost:3000/rest'

fdescribe('/rest/track-order/:id', () => {
  it('GET tracking results for the order id', done => {
    frisby.get(REST_URL + '/track-order/5267-f9cd5882f54c75a3')
      .expect('status', 200)
      .expect('json', {})
      .done(done)
  })

  it('GET all orders by injecting into orderId', done => {
    frisby.get(REST_URL + '/track-order/\'%2520%257C%257C%2520true%2520%257C%257C%2520\'')
      .expect('status', 200)
      .expect('json', {})
      .done(done)
  })
})
