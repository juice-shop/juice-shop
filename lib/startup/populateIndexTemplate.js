const fs = require('fs-extra')
const config = require('config')
const replace = require('replace')
const utils = require('../utils')

const populateIndexTemplate = () => {
  if (config.get('application.logo')) {
    let logo = config.get('application.logo')
    if (utils.startsWith(logo, 'http')) {
      const logoPath = logo
      logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
      utils.downloadToFile(logoPath, 'frontend/dist/frontend/assets/public/images/' + logo)
    }
  }
  if (config.get('application.theme')) {
    replaceTheme()
  }
  if (config.get('application.cookieConsent')) {
    replaceCookieConsent()
  }
}

const replaceTheme = () => {
  const bodyClass = '"mat-app-background ' + config.get('application.theme') + '-theme"'
  replace({
    regex: /"mat-app-background .*-theme"/,
    replacement: bodyClass,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const replaceCookieConsent = () => { // FIXME Cookie banner still missing in new Angular frontend
  const popupProperty = '"popup": { "background": "' + config.get('application.cookieConsent.backgroundColor') + '", "text": "' + config.get('application.cookieConsent.textColor') + '" }'
  replace({
    regex: /"popup": { "background": ".*", "text": ".*" }/,
    replacement: popupProperty,
    paths: ['app/index.html'],
    recursive: false,
    silent: true
  })
  const buttonProperty = '"button": { "background": "' + config.get('application.cookieConsent.buttonColor') + '", "text": "' + config.get('application.cookieConsent.buttonTextColor') + '" }'
  replace({
    regex: /"button": { "background": ".*", "text": ".*" }/,
    replacement: buttonProperty,
    paths: ['app/index.html'],
    recursive: false,
    silent: true
  })
  const contentProperty = '"content": { "message": "' + config.get('application.cookieConsent.message') + '", "dismiss": "' + config.get('application.cookieConsent.dismissText') + '", "link": "' + config.get('application.cookieConsent.linkText') + '", "href": "' + config.get('application.cookieConsent.linkUrl') + '" }'
  replace({
    regex: /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/,
    replacement: contentProperty,
    paths: ['app/index.html'],
    recursive: false,
    silent: true
  })
}

module.exports = populateIndexTemplate
