/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'

const slugify = (name: string) => {
  return name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
}

export const customizeTerraformContent = (content: string) => {
  const appName = config.get<string>('application.name')
  if (!appName || appName === 'OWASP Juice Shop') {
    return content
  }

  const slugName = slugify(appName)
  const snakeName = slugName.replace(/-/g, '_')
  return content
    .replace(/juice-shop/g, slugName)
    .replace(/juice_shop/g, snakeName)
}
