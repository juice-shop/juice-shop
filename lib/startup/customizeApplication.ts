/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import config from 'config'
import * as utils from '../utils'

const customizeApplication = async () => {
  if (config.get<string>('application.name')) {
    customizeTitle()
  }
  if (config.get('application.logo')) {
    void customizeLogo()
  }
  if (config.get('application.favicon')) {
    void customizeFavicon()
  }
  if (config.get('application.theme')) {
    customizeTheme()
  }
  if (config.get('application.cookieConsent')) {
    customizeCookieConsentBanner()
  }
  if (config.get('application.promotion')) {
    void customizePromotionVideo()
    void customizePromotionSubtitles()
  }
  if (config.get('hackingInstructor')) {
    void customizeHackingInstructorAvatar()
  }
  if (config.get('application.chatBot')) {
    void customizeChatbotAvatar()
  }
}

const customizeLogo = async () => {
  await retrieveCustomFile('application.logo', 'frontend/dist/frontend/assets/public/images')
}

const customizeChatbotAvatar = async () => {
  const avatarImage = await retrieveCustomFile('application.chatBot.avatar', 'frontend/dist/frontend/assets/public/images')
  if (avatarImage) {
    fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/chatbotAvatar.png')
  }
}

const customizeHackingInstructorAvatar = async () => {
  const avatarImage = await retrieveCustomFile('hackingInstructor.avatarImage', 'frontend/dist/frontend/assets/public/images')
  if (avatarImage) {
    fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/hackingInstructor.png')
  }
}

const customizeFavicon = async () => {
  const favicon = await retrieveCustomFile('application.favicon', 'frontend/dist/frontend/assets/public')
  if (!favicon) {
    return
  }
  utils.replaceInFile('frontend/dist/frontend/index.html', /type="image\/x-icon" href="assets\/public\/.*"/, `type="image/x-icon" href="assets/public/${favicon}"`)
}

const customizePromotionVideo = async () => {
  await retrieveCustomFile('application.promotion.video', 'frontend/dist/frontend/assets/public/videos')
}

const customizePromotionSubtitles = async () => {
  await retrieveCustomFile('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos')
}

export const retrieveCustomFile = async (
  sourceProperty: string,
  destinationFolder: string,
  downloadFile = utils.downloadToFile
): Promise<string | undefined> => {
  let file = config.get<string>(sourceProperty)
  if (utils.isUrl(file)) {
    const filePath = file
    file = utils.extractFilename(file)
    const downloaded = await downloadFile(filePath, destinationFolder + '/' + file)
    if (!downloaded) {
      return undefined
    }
  }
  return file
}

const customizeTitle = () => {
  const title = `<title>${config.get<string>('application.name')}</title>`
  utils.replaceInFile('frontend/dist/frontend/index.html', /<title>.*<\/title>/, title)
}

const customizeTheme = () => {
  const bodyClass = '"' + config.get<string>('application.theme') + '-theme"'
  utils.replaceInFile('frontend/dist/frontend/index.html', /".*-theme"/, bodyClass)
}

const customizeCookieConsentBanner = () => {
  const contentProperty = '"content": { "message": "' + config.get<string>('application.cookieConsent.message') + '", "dismiss": "' + config.get<string>('application.cookieConsent.dismissText') + '", "link": "' + config.get<string>('application.cookieConsent.linkText') + '", "href": "' + config.get<string>('application.cookieConsent.linkUrl') + '" }'
  utils.replaceInFile('frontend/dist/frontend/index.html', /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/, contentProperty)
}

export default customizeApplication
