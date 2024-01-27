/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'
import config from 'config'
import * as utils from '../utils'
// @ts-expect-error FIXME due to non-existing type definitions for replace
import replace from 'replace'

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
  fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/ChatbotAvatar.png')
}

const customizeHackingInstructorAvatar = async () => {
  const avatarImage = await retrieveCustomFile('hackingInstructor.avatarImage', 'frontend/dist/frontend/assets/public/images')
  fs.copyFileSync('frontend/dist/frontend/assets/public/images/' + avatarImage, 'frontend/dist/frontend/assets/public/images/hackingInstructor.png')
}

const customizeFavicon = async () => {
  const favicon = await retrieveCustomFile('application.favicon', 'frontend/dist/frontend/assets/public')
  replace({
    regex: /type="image\/x-icon" href="assets\/public\/.*"/,
    replacement: `type="image/x-icon" href="assets/public/${favicon}"`,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizePromotionVideo = async () => {
  await retrieveCustomFile('application.promotion.video', 'frontend/dist/frontend/assets/public/videos')
}

const customizePromotionSubtitles = async () => {
  await retrieveCustomFile('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos')
}

const retrieveCustomFile = async (sourceProperty: string, destinationFolder: string) => {
  let file = config.get<string>(sourceProperty)
  if (utils.isUrl(file)) {
    const filePath = file
    file = utils.extractFilename(file)
    await utils.downloadToFile(filePath, destinationFolder + '/' + file)
  }
  return file
}

const customizeTitle = () => {
  const title = `<title>${config.get<string>('application.name')}</title>`
  replace({
    regex: /<title>.*<\/title>/,
    replacement: title,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeTheme = () => {
  const bodyClass = '"mat-app-background ' + config.get<string>('application.theme') + '-theme"'
  replace({
    regex: /"mat-app-background .*-theme"/,
    replacement: bodyClass,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeCookieConsentBanner = () => {
  const contentProperty = '"content": { "message": "' + config.get<string>('application.cookieConsent.message') + '", "dismiss": "' + config.get<string>('application.cookieConsent.dismissText') + '", "link": "' + config.get<string>('application.cookieConsent.linkText') + '", "href": "' + config.get<string>('application.cookieConsent.linkUrl') + '" }'
  replace({
    regex: /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/,
    replacement: contentProperty,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

export default customizeApplication
