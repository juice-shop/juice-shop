/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as frisby from 'frisby'

const URL = 'http://localhost:3000'

describe('/api', () => {
  it('GET main.js contains Cryptocurrency URLs', () => {
    return frisby.get(URL + '/main.js')
      .expect('status', 200)
      .expect('bodyContains', '/redirect?to=https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm')
      .expect('bodyContains', '/redirect?to=https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW')
      .expect('bodyContains', '/redirect?to=https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6')
  })

  it('GET main.js contains password hint for support team', () => {
    return frisby.get(URL + '/main.js')
      .expect('status', 200)
      .expect('bodyContains', 'Parola echipei de asisten\\u021b\\u0103 nu respect\\u0103 politica corporativ\\u0103 pentru conturile privilegiate! V\\u0103 rug\\u0103m s\\u0103 schimba\\u021bi parola \\xeen consecin\\u021b\\u0103!')
  })
})
