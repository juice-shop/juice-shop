const config = require('config')
const http = require('http')

const REST_URL = 'http://localhost:3000/rest'

describe('/#/search', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  protractor.beforeEach.login({ email: 'bender@' + config.get('application.domain'), password: 'OhG0dPlease1nsertLiquor!' })

  describe('challenge "User Impersonation"', () => {
    let reviewId

    beforeAll((done) => {
      http.get(REST_URL + '/product/1/reviews', (res) => {
        let body = ''

        res.on('data', chunk => {
          body += chunk
        })

        res.on('end', () => {
          const response = JSON.parse(body)
          reviewId = response.data[0]._id
          done()
        })
      })
    })

    it('should be possible to edit any review', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": "' + reviewId + '", "message": "injected" });')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'User Impersonation' })
  })
})
