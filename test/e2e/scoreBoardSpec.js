'use strict'

describe('/#/score-board', function () {
  describe('challenge "scoreBoard"', function () {
    it('should be possible to access score board', function () {
      browser.get('/#/score-board')
      expect(browser.getLocationAbsUrl()).toMatch(/\/score-board/)
    })

    protractor.expect.challengeSolved({challenge: 'Score Board'})
  })

  describe('challenge "continueCode"', function () {
    it('should be possible to solve the non-existent challenge #99', function () {
      browser.executeScript('document.cookie="continueCode=69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkKgGe9M7k2rK63YpqQLPjnlb5V5LvDj"')
      browser.get('/#/score-board')
      element(by.id('restoreProgressButton')).click()
    })

    protractor.expect.challengeSolved({challenge: 'Imaginary Challenge'})
  })
})
