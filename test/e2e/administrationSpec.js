const config = require('config')

describe('/#/administration', () => {
  describe('challenge "adminSection"', () => {
    it('should be possible to access administration section even when not authenticated', () => {
      browser.get('/#/administration')
      expect(browser.getCurrentUrl()).toMatch(/\/administration/)
    })

    protractor.expect.challengeSolved({ challenge: 'Admin Section' })
  })

  describe('challenge "fiveStarFeedback"', () => {
    protractor.beforeEach.login({ email: 'jim@' + config.get('application.domain'), password: 'ncc-1701' })

    it('should be possible for any logged-in user to delete feedback', () => {
      browser.get('/#/administration')

      $$('.mat-cell.mat-column-remove > button').first().click()
      browser.wait(protractor.ExpectedConditions.stalenessOf(element(by.js(selectFiveStarRating))), 5000)
    })

    protractor.expect.challengeSolved({ challenge: 'Five-Star Feedback' })
  })
})

function selectFiveStarRating () {
  var rating = document.querySelector('.br-units')
  if (rating.querySelectorAll('.br-selected').length === 5) {
    return rating
  }
}
