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
    it('should be possible to solve the non-existent challenge #99', () => { // FIXME Fails after merging gsoc-frontend and -challenges
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PUT","http://localhost:3000/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkKgGe9M7k2rK63YpqQLPjnlb5V5LvDj", true); xhttp.setRequestHeader("Content-type","text/plain"); xhttp.send();') // eslint-disable-line
      browser.get('/#/score-board')
    })

    protractor.expect.challengeSolved({challenge: 'Imaginary Challenge'})
  })

  describe('repeat notification', () => {
    let alertsBefore, alertsNow

    beforeEach(() => {
      browser.get('/#/score-board')
    })

    if (config.get('application.showChallengeSolvedNotifications') && config.get('ctf.showFlagsInNotifications')) {
      xit('should be possible when in CTF mode', () => {
        alertsBefore = element.all(by.className('alert')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('alert')).count()

        expect(alertsBefore).not.toBe(alertsNow)
      })
    } else {
      xit('should not be possible when not in CTF mode', () => {
        alertsBefore = element.all(by.className('alert')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('alert')).count()

        expect(alertsBefore).toBe(alertsNow)
      })
    }
  })
})
