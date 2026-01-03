/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import locales from '../data/static/locales.json'
import { readFile, readdir } from 'node:fs/promises'
import { type Request, type Response, type NextFunction } from 'express'

export function getLanguageList () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const languages: Array<{ key: string, lang: any, icons: string[], shortKey: string, percentage: number, gauge: string }> = []

      const enContentStr = await readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8')
      const enContent = JSON.parse(enContentStr)

      let backendEnContent: any = null
      try {
        const backendEnContentStr = await readFile('i18n/en.json', 'utf-8')
        backendEnContent = JSON.parse(backendEnContentStr)
      } catch {
        // Backend translations not available, will use frontend-only percentages
      }

      const languageFiles = await readdir('frontend/dist/frontend/assets/i18n/')

      const languagePromises = languageFiles.map(async (fileName) => {
        const content = await readFile('frontend/dist/frontend/assets/i18n/' + fileName, 'utf-8')
        const fileContent = JSON.parse(content)
        const frontendPercentage = calcPercentage(fileContent, enContent)
        const key = fileName.substring(0, fileName.indexOf('.'))
        const locale = locales.find((l) => l.key === key)

        let backendPercentage = 0
        if (backendEnContent !== null) {
          try {
            const backendContent = await readFile('i18n/' + fileName, 'utf-8')
            const backendFileContent = JSON.parse(backendContent)
            backendPercentage = calcPercentage(backendFileContent, backendEnContent)
          } catch {
            backendPercentage = 0
          }
        }

        const percentage = backendEnContent !== null ? (frontendPercentage + backendPercentage) / 2 : frontendPercentage
        const gauge = (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))

        const lang: any = {
          key,
          lang: fileContent.LANGUAGE,
          icons: locale?.icons,
          shortKey: locale?.shortKey,
          percentage,
          gauge
        }
        if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
          return lang
        }
        return null
      })

      const results = await Promise.all(languagePromises)
      results.forEach((lang) => {
        if (lang !== null) {
          languages.push(lang)
        }
      })

      languages.push({ key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English', percentage: 100, gauge: 'full' })
      languages.sort((a, b) => a.lang.localeCompare(b.lang))
      res.status(200).json(languages)
    } catch (err: any) {
      next(err)
    }
  }

  function calcPercentage (fileContent: any, enContent: any): number {
    const totalStrings = Object.keys(enContent).length
    let differentStrings = 0
    for (const key in fileContent) {
      if (Object.prototype.hasOwnProperty.call(fileContent, key) && fileContent[key] !== enContent[key]) {
        differentStrings++
      }
    }
    return (differentStrings / totalStrings) * 100
  }
}
