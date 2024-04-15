import frisby = require('frisby')
import config from 'config'

const URL = 'http://localhost:3000'

describe('/redirect', () => {
  it('GET redirected to a whitelisted URL when a valid "to" parameter is passed', () => {
    const allowedRedirects = [
        'https://github.com/juice-shop/juice-shop',
        'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
        'http://shop.spreadshirt.com/juiceshop',
        'http://shop.spreadshirt.de/juiceshop',
        'https://www.stickeryou.com/products/owasp-juice-shop/794',
        'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
        'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6'
    ];
    
    const targetUrl = 'https://github.com/juice-shop/juice-shop'; // Example valid target URL
    if (!allowedRedirects.includes(targetUrl)) {
        throw new Error(`Unrecognized target URL for redirect: ${targetUrl}`);
    }
    
    return frisby.get(`${URL}/redirect?to=${targetUrl}`, { redirect: 'manual' })
            .expect('status', 302);
  })

  it('GET error message when calling /redirect without query parameter', () => {
    return frisby.get(`${URL}/redirect`)
      .expect('status', 400)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'Bad Request');
  })

  it('GET error message when calling /redirect with unrecognized query parameter', () => {
    return frisby.get(`${URL}/redirect?x=y`)
      .expect('status', 400)
      .expect('header', 'content-type', /text\/html/)
      .expect('bodyContains', 'Bad Request');
  })
})
