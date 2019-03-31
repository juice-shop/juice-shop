var fs = require('fs')
var jsDiff = require('diff')

module.exports = function getLanguageList () {
  const iconMap = [
    { key: 'en', icons: ['gb', 'us'], lang: 'English' },
    { key: 'ar_SA', icons: ['ae', 'tn'], lang: 'عربى' },
    { key: 'az_AZ', icons: ['az'], lang: 'Azərbaycanca', isFlask: true },
    { key: 'bg_BG', icons: ['bg'], lang: 'български (език)' },
    { key: 'cs_CZ', icons: ['cz'], lang: 'Česky', isFlask: true },
    { key: 'da_DK', icons: ['dk'], lang: 'Dansk', isFlask: true },
    { key: 'de_DE', icons: ['de'], lang: 'Deutsch' },
    { key: 'el_GR', icons: ['gr'], lang: 'Ελληνικά', isFlask: true },
    { key: 'es_ES', icons: ['es'], lang: 'Español', isFlask: true },
    { key: 'et_EE', icons: ['ee'], lang: 'Eesti' },
    { key: 'fi_FI', icons: ['fi'], lang: 'Suomalainen', isFlask: true },
    { key: 'fr_FR', icons: ['fr'], lang: 'Français' },
    { key: 'ka_GE', icons: ['ge'], lang: 'ქართული' },
    { key: 'he_IL', icons: ['il'], lang: 'עברית' },
    { key: 'hi_IN', icons: ['in'], lang: 'हिंदी' },
    { key: 'hu_HU', icons: ['hu'], lang: 'Magyar', isFlask: true },
    { key: 'id_ID', icons: ['id'], lang: 'Bahasa Indonesia' },
    { key: 'it_IT', icons: ['it'], lang: 'Italiano' },
    { key: 'ja_JP', icons: ['jp'], lang: '日本の', isFlask: true },
    { key: 'ko_KR', icons: ['kr'], lang: '영어' },
    { key: 'lt_LT', icons: ['lt'], lang: 'Lietuviešu', isFlask: true },
    { key: 'lv_LV', icons: ['lv'], lang: 'Latvijas', isFlask: true },
    { key: 'my_MM', icons: ['mm'], lang: 'ျမန္မာ', isFlask: true },
    { key: 'nl_NL', icons: ['nl'], lang: 'Nederlands' },
    { key: 'no_NO', icons: ['no'], lang: 'Norsk', isFlask: true },
    { key: 'pl_PL', icons: ['pl'], lang: 'Język Polski' },
    { key: 'pt_PT', icons: ['pt'], lang: 'Português', isFlask: true },
    { key: 'pt_BR', icons: ['br'], lang: 'Português (Brasil)' },
    { key: 'ro_RO', icons: ['ro'], lang: 'Românesc', isFlask: true },
    { key: 'ru_RU', icons: ['ru'], lang: 'Pусский', isFlask: true },
    { key: 'sv_SE', icons: ['se'], lang: 'Svenska' },
    { key: 'tr_TR', icons: ['tr'], lang: 'Türkçe', isFlask: true },
    { key: 'ur_PK', icons: ['pk'], lang: 'اردو', isFlask: true },
    { key: 'zh_CN', icons: ['cn'], lang: '中国' },
    { key: 'zh_HK', icons: ['hk'], lang: '繁體中文', isFlask: true }
  ]

  return (req, res, next) => {
    let languages = []
    let count = 0
    fs.readdir('frontend/dist/frontend/assets/i18n/', (err, languageFiles) => {
      if (err) {
        next(new Error(`Something went wrong.  Please try again later.`))
      }
      languageFiles.forEach((fileName) => {
        fs.readFile('frontend/dist/frontend/assets/i18n/' + fileName, 'utf-8', async (err, content) => {
          if (err) {
            // Could be considered a verbose error message
            next(new Error(`Language file with the name ${fileName} does not exist.`))
          }
          let fileContent = JSON.parse(content)
          let percentage = await calcPercentage(fileContent)
          let key = fileName.substring(0, fileName.indexOf('.'))
          let iconObj = iconMap.find((x) => x.key === key)
          if (!iconObj) iconObj = ''
          let dataObj = {
            key: key,
            lang: fileContent.LANGUAGE,
            icons: iconObj.icons,
            percentage: percentage
          }
          // Skip this since we are pushing static object
          if (fileName !== 'en.json') {
            languages.push(dataObj)
          }
          count++
          if (count === languageFiles.length) {
            languages.push({ key: 'en', icons: ['gb', 'us'], lang: 'English', percentage: 100 })
            languages.sort((a, b) => a.lang.localeCompare(b.lang))
            res.status(200).json(languages)
          }
        })
      })
    })

    function calcPercentage (fileContent) {
      return new Promise((resolve, reject) => {
        try {
          fs.readFile('frontend/dist/frontend/assets/i18n/en.json', 'utf-8', (err, content) => {
            if (err) {
              // Could be considered a verbose error message
              next(new Error(`Unable to calulate translation percentage`))
            }
            let enContent = JSON.parse(content)
            let diff = jsDiff.diffJson(enContent, fileContent)
            let same = 0
            diff.forEach((part) => {
              if (!part.removed) {
                same++
              }
            })
            resolve((same / diff.length) * 100)
          })
        } catch (err) {
          reject(err)
        }
      })
    }
  }
}
