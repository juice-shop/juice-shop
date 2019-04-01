var fs = require('fs')

module.exports = function getLanguageList () {
  const iconMap = [
    { key: 'en', icons: ['gb', 'us'], lang: 'English' },
    { key: 'ar_SA', icons: ['ae', 'tn'], lang: 'عربى' },
    { key: 'az_AZ', icons: ['az'], lang: 'Azərbaycanca' },
    { key: 'bg_BG', icons: ['bg'], lang: 'български (език)' },
    { key: 'ca_ES', icons: ['es-ct'], lang: 'Catalan' },
    { key: 'cs_CZ', icons: ['cz'], lang: 'Česky' },
    { key: 'da_DK', icons: ['dk'], lang: 'Dansk' },
    { key: 'de_DE', icons: ['de'], lang: 'Deutsch' },
    { key: 'el_GR', icons: ['gr'], lang: 'Ελληνικά' },
    { key: 'es_ES', icons: ['es'], lang: 'Español' },
    { key: 'et_EE', icons: ['ee'], lang: 'Eesti' },
    { key: 'fi_FI', icons: ['fi'], lang: 'Suomalainen' },
    { key: 'fr_FR', icons: ['fr'], lang: 'Français' },
    { key: 'ka_GE', icons: ['ge'], lang: 'ქართული' },
    { key: 'he_IL', icons: ['il'], lang: 'עברית' },
    { key: 'hi_IN', icons: ['in'], lang: 'हिंदी' },
    { key: 'hu_HU', icons: ['hu'], lang: 'Magyar' },
    { key: 'id_ID', icons: ['id'], lang: 'Bahasa Indonesia' },
    { key: 'it_IT', icons: ['it'], lang: 'Italiano' },
    { key: 'ja_JP', icons: ['jp'], lang: '日本の' },
    { key: 'ko_KR', icons: ['kr'], lang: '영어' },
    { key: 'lt_LT', icons: ['lt'], lang: 'Lietuviešu' },
    { key: 'lv_LV', icons: ['lv'], lang: 'Latvijas' },
    { key: 'my_MM', icons: ['mm'], lang: 'ျမန္မာ' },
    { key: 'nl_NL', icons: ['nl'], lang: 'Nederlands' },
    { key: 'no_NO', icons: ['no'], lang: 'Norsk' },
    { key: 'pl_PL', icons: ['pl'], lang: 'Język Polski' },
    { key: 'pt_PT', icons: ['pt'], lang: 'Português' },
    { key: 'pt_BR', icons: ['br'], lang: 'Português (Brasil)' },
    { key: 'ro_RO', icons: ['ro'], lang: 'Românesc' },
    { key: 'ru_RU', icons: ['ru'], lang: 'Pусский' },
    { key: 'sv_SE', icons: ['se'], lang: 'Svenska' },
    { key: 'tr_TR', icons: ['tr'], lang: 'Türkçe' },
    { key: 'ur_PK', icons: ['pk'], lang: 'اردو' },
    { key: 'zh_CN', icons: ['cn'], lang: '中国' },
    { key: 'zh_HK', icons: ['hk'], lang: '繁體中文' }
  ]

  return (req, res, next) => {
    let languages = []
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
          let fileContent = JSON.parse(content)
          let percentage = await calcPercentage(fileContent, enContent)
          let key = fileName.substring(0, fileName.indexOf('.'))
          let iconObj = iconMap.find((x) => x.key === key)
          if (!iconObj) iconObj = ''
          let dataObj = {
            key: key,
            lang: fileContent.LANGUAGE,
            icons: iconObj.icons,
            percentage: percentage,
            gauge: (percentage > 90 ? 'full' : (percentage > 70 ? 'three-quarters' : (percentage > 50 ? 'half' : (percentage > 30 ? 'quarter' : 'empty'))))
          }
          if (!(fileName === 'en.json' || fileName === 'tlh_AA.json')) {
            languages.push(dataObj)
          }
          count++
          if (count === languageFiles.length) {
            languages.push({ key: 'en', icons: ['gb', 'us'], lang: 'English', percentage: 100, gauge: 'full' })
            languages.sort((a, b) => a.lang.localeCompare(b.lang))
            res.status(200).json(languages)
          }
        })
      })
    })

    function calcPercentage (fileContent, enContent) {
      let totalStrings = Object.keys(enContent).length
      let differentStrings = 0
      return new Promise((resolve, reject) => {
        try {
          for (let key in fileContent) {
            if (fileContent.hasOwnProperty(key) && fileContent[key] !== enContent[key]) {
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
