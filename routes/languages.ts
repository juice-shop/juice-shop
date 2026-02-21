/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import locales from '../data/static/locales.json'
import fs from 'node:fs/promises'
import path from 'node:path'
import { type Request, type Response } from 'express'

export function getLanguageList () {
  return async (req: Request, res: Response) => {
    const FRONTEND_I18N = 'frontend/dist/frontend/assets/i18n/'
    const BACKEND_I18N = 'i18n/'

    try {
      const [enFrontend, enBackend] = await Promise.all([
        fs.readFile(path.resolve(FRONTEND_I18N, 'en.json'), 'utf-8').then(JSON.parse),
        fs.readFile(path.resolve(BACKEND_I18N, 'en.json'), 'utf-8').then(JSON.parse)
      ])

      const [frontendFiles, backendFiles] = await Promise.all([
        fs.readdir(path.resolve(FRONTEND_I18N)),
        fs.readdir(path.resolve(BACKEND_I18N))
      ])

      const allFiles = Array.from(new Set([...frontendFiles, ...backendFiles])).filter(f => f.endsWith('.json'))
      const languages: Array<{ key: string, lang: string, icons: string[] | undefined, shortKey: string | undefined, percentage: number, gauge: string }> = []

      await Promise.all(allFiles.map(async (fileName) => {
        if (fileName === 'en.json' || fileName === 'tlh_AA.json') return

        const [frontendContent, backendContent] = await Promise.all([
          fs.readFile(path.resolve(FRONTEND_I18N, fileName), 'utf-8').then(JSON.parse).catch(() => ({})),
          fs.readFile(path.resolve(BACKEND_I18N, fileName), 'utf-8').then(JSON.parse).catch(() => ({}))
        ])

        const percentage = calcJointPercentage(enFrontend, enBackend, frontendContent, backendContent)
        const key = fileName.substring(0, fileName.indexOf('.'))
        const locale = locales.find((l) => l.key === key)

        languages.push({
          key,
          lang: (frontendContent.LANGUAGE || backendContent.LANGUAGE || key) as string,
          icons: locale?.icons,
          shortKey: locale?.shortKey,
          percentage,
          gauge: getGauge(percentage)
        })
      }))

      languages.push({ key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English', percentage: 100, gauge: 'full' })
      languages.sort((a, b) => a.lang.localeCompare(b.lang))
      res.status(200).json(languages)
    } catch (err) {
      res.status(500).json({ error: (err instanceof Error ? err.message : 'Internal Server Error') })
    }
  }

  function calcJointPercentage (enFrontend: any, enBackend: any, frontendContent: any, backendContent: any): number {
    const totalStrings = Object.keys(enFrontend).length + Object.keys(enBackend).length
    let differentStrings = 0

    for (const key in frontendContent) {
      if (Object.prototype.hasOwnProperty.call(frontendContent, key) && frontendContent[key] !== enFrontend[key]) {
        differentStrings++
      }
    }
    for (const key in backendContent) {
      if (Object.prototype.hasOwnProperty.call(backendContent, key) && backendContent[key] !== enBackend[key]) {
        differentStrings++
      }
    }

    return totalStrings > 0 ? (differentStrings / totalStrings) * 100 : 0
  }

  function getGauge (percentage: number): string {
    if (percentage > 90) return 'full'
    if (percentage > 70) return 'three-quarters'
    if (percentage > 50) return 'half'
    if (percentage > 30) return 'quarter'
    return 'empty'
  }
}
