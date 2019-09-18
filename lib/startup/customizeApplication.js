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
  if (config.get('application.promotion')) {
    customizePromotionVideo()
    customizePromotionSubtitles()
  }
  if (config.get('application.deluxePage')) {
    customizeDeluxeDeliveryImage()
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
    file = decodeURIComponent(file.substring(file.lastIndexOf('/') + 1))
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

const customizeDeluxeDeliveryImage = () => {
  let originDeluxeDeliveryImage = 'default.png'
  if (config.get('application.deluxePage.deluxeDeliveryImage') !== null) {
    originDeluxeDeliveryImage = retrieveCustomFile('application.deluxePage.deluxeDeliveryImage', 'frontend/dist/frontend/assets/public/images/deluxe')
  }
  utils.copyToFile('frontend/dist/frontend/assets/public/images/deluxe/' + originDeluxeDeliveryImage, 'frontend/dist/frontend/assets/public/images/deluxe/delivery.png')
}

module.exports = customizeApplication
