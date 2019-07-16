var fs = require('fs')

module.exports = function getLanguageList () {
  const iconMap = [
    { key: 'en', icons: ['gb', 'us'], shortKey: 'EN', lang: 'English' },
    { key: 'ar_SA', icons: ['ae', 'tn'], shortKey: 'AR', lang: 'عربى' },
    { key: 'az_AZ', icons: ['az'], shortKey: 'AZ', lang: 'Azərbaycanca' },
    { key: 'bg_BG', icons: ['bg'], shortKey: 'BG', lang: 'български (език)' },
    { key: 'ca_ES', icons: ['es-ct'], shortKey: 'CA', lang: 'Catalan' },
    { key: 'cs_CZ', icons: ['cz'], shortKey: 'CS', lang: 'Česky' },
    { key: 'da_DK', icons: ['dk'], shortKey: 'DA', lang: 'Dansk' },
    { key: 'de_DE', icons: ['de'], shortKey: 'DE', lang: 'Deutsch' },
    { key: 'el_GR', icons: ['gr'], shortKey: 'EL', lang: 'Ελληνικά' },
    { key: 'es_ES', icons: ['es'], shortKey: 'ES', lang: 'Español' },
    { key: 'et_EE', icons: ['ee'], shortKey: 'ET', lang: 'Eesti' },
    { key: 'fi_FI', icons: ['fi'], shortKey: 'FI', lang: 'Suomalainen' },
    { key: 'fr_FR', icons: ['fr'], shortKey: 'FR', lang: 'Français' },
    { key: 'ka_GE', icons: ['ge'], shortKey: 'KA', lang: 'ქართული' },
    { key: 'he_IL', icons: ['il'], shortKey: 'HE', lang: 'עברית' },
    { key: 'hi_IN', icons: ['in'], shortKey: 'HI', lang: 'हिंदी' },
    { key: 'hu_HU', icons: ['hu'], shortKey: 'HU', lang: 'Magyar' },
    { key: 'id_ID', icons: ['id'], shortKey: 'ID', lang: 'Bahasa Indonesia' },
    { key: 'it_IT', icons: ['it'], shortKey: 'IT', lang: 'Italiano' },
    { key: 'ja_JP', icons: ['jp'], shortKey: 'JA', lang: '日本の' },
    { key: 'ko_KR', icons: ['kr'], shortKey: 'KO', lang: '영어' },
    { key: 'lt_LT', icons: ['lt'], shortKey: 'LT', lang: 'Lietuviešu' },
    { key: 'lv_LV', icons: ['lv'], shortKey: 'LV', lang: 'Latvijas' },
    { key: 'my_MM', icons: ['mm'], shortKey: 'MY', lang: 'ျမန္မာ' },
    { key: 'nl_NL', icons: ['nl'], shortKey: 'NL', lang: 'Nederlands' },
    { key: 'no_NO', icons: ['no'], shortKey: 'NO', lang: 'Norsk' },
    { key: 'pl_PL', icons: ['pl'], shortKey: 'PL', lang: 'Język Polski' },
    { key: 'pt_PT', icons: ['pt'], shortKey: 'PT', lang: 'Português' },
    { key: 'pt_BR', icons: ['br'], shortKey: 'BR', lang: 'Português (Brasil)' },
    { key: 'ro_RO', icons: ['ro'], shortKey: 'RO', lang: 'Românesc' },
    { key: 'ru_RU', icons: ['ru'], shortKey: 'RU', lang: 'Pусский' },
    { key: 'sv_SE', icons: ['se'], shortKey: 'SV', lang: 'Svenska' },
    { key: 'tr_TR', icons: ['tr'], shortKey: 'TR', lang: 'Türkçe' },
    { key: 'ur_PK', icons: ['pk'], shortKey: 'UR', lang: 'اردو' },
    { key: 'zh_CN', icons: ['cn'], shortKey: 'CN', lang: '中国' },
    { key: 'zh_HK', icons: ['hk'], shortKey: 'HK', lang: '繁體中文' }
  ]

  return (req, res, next) => {
    const languages = []
    let count = 0
    let enContent

    fs.readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8', (err, content) => {
      if (err) {
        next(new Error(`Unable to retrieve en.json language file: ${err.message}`))
      }
      enContent = JSON.parse(content)
    })

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
          let iconObj = iconMap.find((x) => x.key === key)
          if (!iconObj) iconObj = ''
          const dataObj = {
            key: key,
            lang: fileContent.LANGUAGE,
            icons: iconObj.icons,
            shortKey: iconObj.shortKey,
            percentage: percentage,
            gauge: (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))
          }
          if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
            languages.push(dataObj)
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
