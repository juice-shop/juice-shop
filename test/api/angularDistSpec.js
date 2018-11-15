const frisby = require('frisby')

const URL = 'http://localhost:3000'

describe('/api', () => {
  it('GET main.js contains Gratipay URL', () => {
    return frisby.get(URL + '/main.js')
      .expect('status', 200)
      .expect('bodyContains', '/redirect?to=https://gratipay.com/juice-shop')
  })

  it('GET main.js contains password hint for support team', () => {
    return frisby.get(URL + '/main.js')
      .expect('status', 200)
      .expect('bodyContains', '@echipa de suport: Secretul nostru comun este \\xeenc\\u0103 Caoimhe cu parola de master gol!')
  })
})
