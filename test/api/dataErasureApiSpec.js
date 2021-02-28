// /*
//  * Copyright (c) 2014-2021 Bjoern Kimminich.
//  * SPDX-License-Identifier: MIT
//  */

// const frisby = require('frisby')

// const URL = 'http://localhost:3000'
// const REST_URL = 'http://localhost:3000/rest'
// const jsonHeader = { 'content-type': 'application/json' }
// const cookie = {'Cookie': ''}

// describe('/datarasure', () => {
//   it('GET data-erasure page', () => {
//     return frisby.post(REST_URL + '/user/login', {
//       headers: jsonHeader,
//       body: {
//         email: 'bjoern.kimminich@gmail.com',
//         password: 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
//       }
//     }).expect('status', 200)
//     .then(() => {
//       return frisby.get(URL + '/dataerasure', {
//         headers:
//       })
//       .expect('status', 200)
//       .expect('header', 'content-type', /text\/html/)
//     })
//     })
// })
