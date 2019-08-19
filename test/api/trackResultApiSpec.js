const frisby = require('frisby')
const Joi = frisby.Joi
const config = require('config')

const REST_URL = 'http://localhost:3000/rest'

describe('/rest/track-order/:id', () => {
  it('GET tracking results for the order id', () => {
    return frisby.get(REST_URL + '/track-order/5267-f9cd5882f54c75a3')
      .expect('status', 200)
      .expect('json', {})
  })

  it('GET all orders by injecting into orderId', () => {
    var product = Joi.object().keys({
      quantity: Joi.number(),
      name: Joi.string(),
      price: Joi.number(),
      total: Joi.number()
    })
    return frisby.get(REST_URL + '/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        orderId: Joi.string(),
        email: Joi.string(),
        totalPrice: Joi.number(),
        products: Joi.array().items(product),
        eta: Joi.string(),
        _id: Joi.string()
      })
  })

  it('GET order ids get truncated after 40 characters', () => {
    return frisby.get(REST_URL + '/track-order/aaaaabbbbbcccccdddddeeeeefffffggggghhhhhiiiiijjjjj')
      .expect('status', 200)
      .expect('header', 'content-type', /application\/json/)
      .expect('jsonTypes', 'data.*', {
        orderId: 'aaaaabbbbbcccccdddddeeeeefffffggggghhhh...'
      })
  })

  it('GET injected code into order id raises error after being truncated to 40 characters', () => {
    return frisby.get(REST_URL + '/track-order/f%22%27%20%7C%7C%20%28function%28%29%20%7B%7B%20%7Bwhile%20%28true%29%20%7Bconsole.log%28%27endless%20loop%21%27%29%7D%7D%20%7D%7D%29%28%29%3B%20%2F%2F%22')
      .expect('status', 500)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', '<h1>' + config.get('application.name') + ' (Express')
      .expect('bodyContains', 'SyntaxError: Unexpected token ...')
  })
})
