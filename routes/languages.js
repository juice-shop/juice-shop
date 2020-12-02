/*
 * Copyright (c) 2014-2020 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const locales = require('../data/static/locales')

module.exports = function getLanguageList () { // TODO Refactor and extend to also load backend translations from /i18n/*json and calculate joint percentage/gauge
  return (req, res, next) => {
    const languages = []
    let count = 0
    let enContent

    fs.readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8', (err, content) => {
      if (err) {
        next(new Error(`Unable to retrieve en.json language file: ${err.message}`))
      }
      enContent = JSON.parse(content)
      fs.readdir('frontend/dist/frontend/assets/i18n/', (err, languageFiles) => {
        if (err) {
          next(new Error(`Unable to read i18n directory: ${err.message}`))
        }
        languageFiles.forEach((fileName) => {
          fs.readFile('frontend/dist/frontend/assets/i18n/' + fileName, 'utf-8', async (err, content) => {
            if (err) {
              next(new Error(`Unable to retrieve ${fileName} language file: ${err.message}`))
            }
            const fileContent = JSON.parse(content)
            const percentage = await calcPercentage(fileContent, enContent)
            const key = fileName.substring(0, fileName.indexOf('.'))
            let locale = locales.find((l) => l.key === key)
            if (!locale) locale = ''
            const lang = {
              key: key,
              lang: fileContent.LANGUAGE,
              icons: locale.icons,
              shortKey: locale.shortKey,
              percentage: percentage,
              gauge: (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))
            }
            if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
              languages.push(lang)
            }
            count++
            if (count === languageFiles.length) {
              languages.push({ key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English', percentage: 100, gauge: 'full' })
              languages.sort((a, b) => a.lang.localeCompare(b.lang))
              res.status(200).json(languages)
            }
          })
        })
      })
    })

    function calcPercentage (fileContent, enContent) {
      const totalStrings = Object.keys(enContent).length
      let differentStrings = 0
      return new Promise((resolve, reject) => {
        try {
          for (const key in fileContent) {
            if (Object.prototype.hasOwnProperty.call(fileContent, key) && fileContent[key] !== enContent[key]) {
              differentStrings++
            }
          }
          resolve((differentStrings / totalStrings) * 100)
        } catch (err) {
          reject(err)
        }
      })
    }
  }
}
