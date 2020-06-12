/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const config = require('config')

const getImageNameFromSrc = src => {
  return src && src.split('/').pop()
}

const downloadImage = src => {
  return browser.executeScript(`
        let a = document.createElement('a')
        a.href = '${src}'
        a.download = '${getImageNameFromSrc(src)}'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    `)
}

const attemptToGetCoordinatesFromMetapicz = imgSrc => {
  return browser.executeAsyncScript(imgSrc => {
        const callback = arguments[arguments.length - 1] // eslint-disable-line

    const fail = () => callback(undefined)

    const getImageBlob = url => {
      return new Promise((resolve, reject) => {
        try {
          const request = new XMLHttpRequest()
          request.open('GET', url)
          request.responseType = 'blob'
          request.onerror = () => { reject(new Error('Error while getting image blob: ' + request.statusText)) }
          request.onload = function () {
            if (request.status === 200) {
              const contentType = request.getResponseHeader('Content-Type')
              resolve({ contentType, blob: request.response })
            } else {
              reject(new Error('Error while getting image blob: ' + request.statusText))
            }
          }
          request.send()
        } catch (err) {
          reject(err.message)
        }
      })
    }

    getImageBlob(imgSrc).then(({ contentType, blob }) => {
      const request = new XMLHttpRequest()
      request.open('POST', 'http://metapicz.com/view.php?action=metadata-get&binary=&format=json')
      request.setRequestHeader('Content-type', contentType)
      request.onreadystatechange = () => {
        if (request.readyState === 4 && request.status === 200) {
          if (!request.response) fail()
          const response = JSON.parse(request.response)

          if (!response.result) fail()
          const result = response.result

          const gpsFields = ['GPSLatitude', 'GPSLatitudeRef', 'GPSLongitude', 'GPSLongitudeRef']

          gpsFields.forEach(field => {
            if (!result[field]) fail()
          })

          const { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = result

          const coordinates = (
                        `${GPSLatitude}${GPSLatitudeRef[0]},
                        ${GPSLongitude}${GPSLongitudeRef[0]}`
          )
          callback(coordinates)
        }
      }
      request.send(blob)
    }).catch(() => fail())
  }, imgSrc)
}

describe('/#/geo', () => {
  let email, securityAnswer, newPassword, newPasswordRepeat, resetButton

  const EC = protractor.ExpectedConditions

  const goToAndInitForgotPasswordPage = () => {
    browser.get(protractor.basePath)
    browser.waitForAngularEnabled(true)
    $('#logout').isPresent().then((result) => {
      if (result) {
        $('#logout').click()
      }
    })
    browser.wait(EC.stalenessOf($('#logout')), 5000)
    browser.get(protractor.basePath + '/#/forgot-password')
    email = element(by.id('email'))
    securityAnswer = element(by.id('securityAnswer'))
    newPassword = element(by.id('newPassword'))
    newPasswordRepeat = element(by.id('newPasswordRepeat'))
    resetButton = element(by.id('resetButton'))
  }

  describe('challenge geoStalkingEasy', () => {
    it('Should be possible to find the answer to a security question in the meta-data of a photo on the photo wall', () => {
      browser.get(protractor.basePath + '/#/photo-wall')

      element.all(by.className('image')).each(async image => {
        const imgSrc = await image.getAttribute('src')
        if (imgSrc.endsWith('favorite-hiking-place.png')) {
          downloadImage(imgSrc)

          browser.waitForAngularEnabled(false)
          browser.wait(browser.get('http://metapicz.com/'))

          const coordinates = await attemptToGetCoordinatesFromMetapicz(imgSrc)

          if (coordinates) {
            browser.get(`https://maps.google.com/?q=${coordinates}`)
            browser.sleep(5000)

            const answer = config.get('challenges.geoStalking.securityAnswerEasy')

            goToAndInitForgotPasswordPage()
            email.sendKeys('geo1@gmail.com')
            browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
            securityAnswer.sendKeys(answer)
            newPassword.sendKeys('123456')
            newPasswordRepeat.sendKeys('123456')
            resetButton.click()

            protractor.expect.challengeSolved({ challenge: 'Geo Stalking - Easy' })
          } else {
            fail('Could not get coordinates from image ' + imgSrc)
          }
        }
      })
    })
  })

  describe('challenge geoStalkingHard', () => {
    it('Should be possible to determine the answer to a security question by looking closely at an image on the photo wall', () => {
      browser.get(protractor.basePath + '/#/photo-wall')

      element.all(by.className('image')).each(async image => {
        const imgSrc = await image.getAttribute('src')
        if (imgSrc.endsWith('IMG_4253.jpg')) {
          downloadImage(imgSrc)

          browser.waitForAngularEnabled(false)
          browser.get(imgSrc)
          browser.sleep(5000)

          const answer = config.get('challenges.geoStalking.securityAnswerHard')

          goToAndInitForgotPasswordPage()

          email.sendKeys('geo2@gmail.com')
          browser.wait(EC.visibilityOf(securityAnswer), 1000, 'Security answer field did not become visible')
          securityAnswer.sendKeys(answer)
          newPassword.sendKeys('123456')
          newPasswordRepeat.sendKeys('123456')
          resetButton.click()

          protractor.expect.challengeSolved({ challenge: 'Geo Stalking - Hard' })
        }
      })
    })
  })
})
