/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { type Request, type Response } from 'express'

export function retrieveAppConfiguration () {
  return (_req: Request, res: Response) => {
    const safeConfig = structuredClone(config.util.toObject(config))
    if (safeConfig.application?.chatBot) {
      delete safeConfig.application.chatBot.llmApiUrl
    }
    if (safeConfig.application?.googleOauth?.authorizedRedirects) {
      const privateIpRegex = /^(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/
      safeConfig.application.googleOauth.authorizedRedirects = safeConfig.application.googleOauth.authorizedRedirects.filter((r: any) => {
        try {
          const url = new URL(r.uri)
          return !privateIpRegex.test(url.hostname)
        } catch (e) {
          return true
        }
      })
    }
    res.json({ config: safeConfig })
  }
}
