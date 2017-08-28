'use strict'

const config = require('config')

describe('/#/administration', function () {
  describe('challenge "adminSection"', function () {
    it('should be possible to access administration section even when not authenticated', function () {
      browser.get('/#/administration')
      expect(browser.getLocationAbsUrl()).toMatch(/\/administration/)
    })

    protractor.expect.challengeSolved({challenge: 'Admin Section'})
  })

  describe('challenge "fiveStarFeedback"', function () {
    protractor.beforeEach.login({email: 'jim@' + config.get('application.domain'), password: 'ncc-1701'})

    it('should be possible for any logged-in user to delete feedback', function () {
      browser.get('/#/administration')

      element.all(by.repeater('feedback in feedbacks')).first().element(by.css('.fa-trash')).click()
      browser.wait(protractor.ExpectedConditions.stalenessOf($('span[aria-valuenow="5"]')), 5000) // eslint-disable-line no-undef
    })

    protractor.expect.challengeSolved({challenge: 'Five-Star Feedback'})
  })
})
