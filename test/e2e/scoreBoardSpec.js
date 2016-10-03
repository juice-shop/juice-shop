'use strict'

describe('/#/score-board', function () {

  describe('challenge "scoreBoard"', function () {
    it('should be possible to access score board', function () {
      browser.get('/#/score-board')
      expect(browser.getLocationAbsUrl()).toMatch(/\/score-board/)
    })

    protractor.expect.challengeSolved({challenge: 'scoreBoard'})
  })

  describe('challenge "continueCode"', function () {
    it('should be possible to solve the non-existent challenge #99', function () {
      browser.get('/#/score-board')
      element(by.id('collapseContinueButton')).click()
      element(by.model('continueCode')).sendKeys('KaWpRZrn3Djm9PK54pJGWv8OaekoVMWq2BzAZbMNq0Lxy1YlXQR76gEDMoJn')
      element(by.id('restoreProgressButton')).click()
    })

    protractor.expect.challengeSolved({challenge: 'continueCode'})
  })
})
