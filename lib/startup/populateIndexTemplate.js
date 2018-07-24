const fs = require('fs-extra')
const config = require('config')
const replace = require('replace')
const utils = require('../utils')

const populateIndexTemplate = () => {
  fs.copy('app/index.template.html', 'app/index.html', { overwrite: true }, () => {
    if (config.get('application.logo')) {
      let logo = config.get('application.logo')
      if (utils.startsWith(logo, 'http')) {
        const logoPath = logo
        logo = decodeURIComponent(logo.substring(logo.lastIndexOf('/') + 1))
        // utils.downloadToFile(logoPath, 'app/public/images/' + logo)
        utils.downloadToFile(logoPath, 'frontend/src/assets/public/images/' + logo)
      }
      replaceLogo(logo)
    }
    if (config.get('application.theme')) {
      replaceTheme()
    }
    if (config.get('application.cookieConsent')) {
      replaceCookieConsent()
    }
  })
}

const replaceLogo = (logo) => {
  const logoImageTag = '<img class="navbar-brand navbar-logo" src="/public/images/' + logo + '">'
  replace({
    regex: /<img class="navbar-brand navbar-logo"(.*?)>/,
    replacement: logoImageTag,
    paths: ['app/index.html'],
    recursive: false,
    silent: true
  })
}

const replaceTheme = () => {
  const themeCss = 'node_modules/bootswatch/' + config.get('application.theme') + '/bootstrap.min.css'
  replace({
    regex: /node_modules\/bootswatch\/.*\/bootstrap\.min\.css/,
    replacement: themeCss,
    paths: ['app/index.html'],
    recursive: false,
    silent: true
  })
}

const replaceCookieConsent = () => {
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
