const fs = require('fs')
const config = require('config')
const replace = require('replace')
const utils = require('../utils')

const customizeApplication = () => {
  if (config.get('application.name')) {
    customizeTitle()
  }
  if (config.get('application.logo')) {
    customizeLogo()
  }
  if (config.get('application.favicon')) {
    customizeFavicon()
  }
  if (config.get('application.theme')) {
    customizeTheme()
  }
  if (config.get('application.cookieConsent')) {
    customizeCookieConsentBanner()
  }
  if (config.get('application.promotion')) {
    customizePromotionVideo()
    customizePromotionSubtitles()
  }
  if (config.get('hackingInstructor')) {
    customizeHackingInstructorAvatar()
  }
}

const customizeLogo = () => {
  retrieveCustomFile('application.logo', 'frontend/dist/frontend/assets/public/images')
}

const customizeFavicon = () => {
  const favicon = retrieveCustomFile('application.favicon', 'frontend/dist/frontend/assets/public')
  replace({
    regex: /type="image\/x-icon" href="assets\/public\/.*"/,
    replacement: `type="image/x-icon" href="assets/public/${favicon}"`,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizePromotionVideo = () => {
  retrieveCustomFile('application.promotion.video', 'frontend/dist/frontend/assets/public/videos')
}

const customizePromotionSubtitles = () => {
  retrieveCustomFile('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos')
}

const retrieveCustomFile = (sourceProperty, destinationFolder) => {
  let file = config.get(sourceProperty)
  if (utils.startsWith(file, 'http')) {
    const filePath = file
    file = utils.extractFilename(file)
    utils.downloadToFile(filePath, destinationFolder + '/' + file)
  }
  return file
}

const customizeTitle = () => {
  const title = `<title>${config.get('application.name')}</title>`
  replace({
    regex: /<title>.*<\/title>/,
    replacement: title,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeTheme = () => {
  const bodyClass = '"mat-app-background ' + config.get('application.theme') + '-theme"'
  replace({
    regex: /"mat-app-background .*-theme"/,
    replacement: bodyClass,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeCookieConsentBanner = () => {
  const popupProperty = '"popup": { "background": "' + config.get('application.cookieConsent.backgroundColor') + '", "text": "' + config.get('application.cookieConsent.textColor') + '" }'
  replace({
    regex: /"popup": { "background": ".*", "text": ".*" }/,
    replacement: popupProperty,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
  const buttonProperty = '"button": { "background": "' + config.get('application.cookieConsent.buttonColor') + '", "text": "' + config.get('application.cookieConsent.buttonTextColor') + '" }'
  replace({
    regex: /"button": { "background": ".*", "text": ".*" }/,
    replacement: buttonProperty,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
  const contentProperty = '"content": { "message": "' + config.get('application.cookieConsent.message') + '", "dismiss": "' + config.get('application.cookieConsent.dismissText') + '", "link": "' + config.get('application.cookieConsent.linkText') + '", "href": "' + config.get('application.cookieConsent.linkUrl') + '" }'
  replace({
    regex: /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/,
    replacement: contentProperty,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeHackingInstructorAvatar = () => {
  let originAvatarImage = 'juicyBot.png'
  if (config.get('hackingInstructor.avatarImage') !== null) {
    originAvatarImage = retrieveCustomFile('hackingInstructor.avatarImage', 'frontend/dist/frontend/assets/public/images')
  }
  fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + originAvatarImage, 'frontend/dist/frontend/assets/public/images/hackingInstructor.png')
}

module.exports = customizeApplication
