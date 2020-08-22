/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

describe('/chatbot', () => {
  let username, submitButton, messageBox
  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  describe('challenge "killChatbot"', () => {
    it('should be possible to kill the chatbot by setting the process to null', () => {
      browser.waitForAngularEnabled(false)
      browser.get(protractor.basePath + '/profile')
      username = element(by.id('username'))
      submitButton = element(by.id('submit'))
      username.sendKeys('admin"); process=null; users.addUser("1337", "test')
      submitButton.click()
      browser.driver.sleep(5000)
      browser.waitForAngularEnabled(true)

      browser.get(protractor.basePath + '/#/chatbot')
      messageBox = element(by.id('message-input'))
      messageBox.sendKeys('hi')
      browser.actions().sendKeys(protractor.Key.ENTER).perform()
      messageBox.sendKeys('...')
      browser.actions().sendKeys(protractor.Key.ENTER).perform()
      messageBox.sendKeys('bye')
      browser.actions().sendKeys(protractor.Key.ENTER).perform()
    })
    protractor.expect.challengeSolved({ challenge: 'Kill Chatbot' })
  })
})
