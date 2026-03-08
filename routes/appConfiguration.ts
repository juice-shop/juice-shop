/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { isIP } from 'node:net'
import { type Request, type Response } from 'express'

interface AuthorizedRedirect {
  uri?: string
  proxy?: string
}

interface AppConfigResponse {
  application?: {
    googleOauth?: {
      authorizedRedirects?: AuthorizedRedirect[]
    }
  }
}

function isPrivateIpv4Address (host: string): boolean {
  if (/^10\./.test(host)) return true
  if (/^127\./.test(host)) return true
  if (/^192\.168\./.test(host)) return true

  const match = host.match(/^172\.(\d{1,3})\./)
  if (match) {
    const secondOctet = Number.parseInt(match[1], 10)
    return secondOctet >= 16 && secondOctet <= 31
  }

  return false
}

function hasPrivateIpHost (uri: string): boolean {
  try {
    const { hostname } = new URL(uri)
    if (hostname === '::1') {
      return true
    }

    const ipVersion = isIP(hostname)
    if (ipVersion === 4) {
      return isPrivateIpv4Address(hostname)
    }

    return false
  } catch {
    return false
  }
}

function sanitizedConfigForPublicResponse (): AppConfigResponse {
  const configObject = config.util.toObject() as AppConfigResponse
  const applicationConfig = configObject.application
  const googleOauth = applicationConfig?.googleOauth
  const redirects = googleOauth?.authorizedRedirects

  if (googleOauth == null || !Array.isArray(redirects)) {
    return configObject
  }

  googleOauth.authorizedRedirects = redirects.filter(({ uri }) => {
    if (uri == null) {
      return true
    }
    return !hasPrivateIpHost(uri)
  })

  return configObject
}

export function retrieveAppConfiguration () {
  return (_req: Request, res: Response) => {
    res.json({ config: sanitizedConfigForPublicResponse() })
  }
}
