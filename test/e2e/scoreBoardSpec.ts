/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')

describe('/#/score-board', () => {
  describe('challenge "scoreBoard"', () => {
    it('should be possible to access score board', () => {
      browser.get(protractor.basePath + '/#/score-board')
      expect(browser.getCurrentUrl()).toMatch(/\/score-board/)
    })

    protractor.expect.challengeSolved({ challenge: 'Score Board' })
  })

  describe('challenge "continueCode"', () => {
    it('should be possible to solve the non-existent challenge #99', () => {
      browser.executeScript('var xhttp = new XMLHttpRequest(); xhttp.onreadystatechange = function() { if (this.status == 200) { console.log("Success"); } }; xhttp.open("PUT","'+browser.baseUrl+'/rest/continue-code/apply/69OxrZ8aJEgxONZyWoz1Dw4BvXmRGkM6Ae9M7k2rK63YpqQLPjnlb5V5LvDj", true); xhttp.setRequestHeader("Content-type","text/plain"); xhttp.send();') // eslint-disable-line
      browser.get(protractor.basePath + '/#/score-board')
    })

    protractor.expect.challengeSolved({ challenge: 'Imaginary Challenge' })
  })

  describe('repeat notification', () => {
    let alertsBefore, alertsNow

    beforeEach(() => {
      browser.get(protractor.basePath + '/#/score-board')
    })

    if (config.get('challenges.showSolvedNotifications') && config.get('ctf.showFlagsInNotifications')) {
      it('should be possible when in CTF mode', () => {
        alertsBefore = element.all(by.className('challenge-solved-toast')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('challenge-solved-toast')).count()

        expect(alertsBefore).not.toBe(alertsNow)
      })
    } else {
      it('should not be possible when not in CTF mode', () => {
        alertsBefore = element.all(by.className('challenge-solved-toast')).count()

        element(by.id('Score Board.solved')).click()

        alertsNow = element.all(by.className('challenge-solved-toast')).count()

        expect(alertsBefore).toBe(alertsNow)
      })
    }
  })
})
