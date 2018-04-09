const config = require('config')

describe('/#/score-board', () => {
  describe('challenge "scoreBoard"', () => {
    it('should be possible to access score board', () => {
      browser.get('/#/score-board')
      expect(browser.getCurrentUrl()).toMatch(/\/score-board/)
    })

    protractor.expect.challengeSolved({challenge: 'Score Board'})
  })

  describe('challenge "continueCode"', () => {
    it('should be possible to solve the non-existent challenge #99', () => {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.put(\'/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkKgGe9M7k2rK63YpqQLPjnlb5V5LvDj\');')
      browser.get('/#/score-board')
    })

    protractor.expect.challengeSolved({challenge: 'Imaginary Challenge'})
  })

  describe('repeat notification', () => {
    let alertsBefore, alertsNow

    beforeEach(() => {
      browser.get('/#/score-board')
    })

    if (config.get('application.showChallengeSolvedNotifications') && config.get('application.showCtfFlagsInNotifications')) {
      it('should be possible when in CTF mode', () => {
        alertsBefore = element.all(by.className('alert')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('alert')).count()

        expect(alertsBefore).not.toBe(alertsNow)
      })
    } else {
      it('should not be possible when not in CTF mode', () => {
        alertsBefore = element.all(by.className('alert')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('alert')).count()

        expect(alertsBefore).toBe(alertsNow)
      })
    }
  })
})
