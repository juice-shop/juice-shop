angular.module('juiceShop').controller('LanguageController', [
  '$scope',
  '$cookies',
  '$translate',
  function ($scope, $cookies, $translate) {
    'use strict'

    if ($cookies.get('language')) {
      var langKey = $cookies.get('language')
      $translate.use(langKey)
    }

    $scope.languages = languages
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey)
      var expireDate = new Date()
      expireDate.setFullYear(expireDate.getFullYear() + 1)
      $cookies.put('language', langKey, { expires: expireDate })
    }
  }])

var languages = [
  { key: 'ar_SA', icon: 'ae', lang: 'عربى' },
  { key: 'cs_CZ', icon: 'cz', lang: 'Česky', isFlask: true },
  { key: 'da_DK', icon: 'dk', lang: 'Dansk', isFlask: true },
  { key: 'de_DE', icon: 'de', lang: 'Deutsch' },
  { key: 'el_GR', icon: 'gr', lang: 'Ελληνικά', isFlask: true },
  { key: 'es_ES', icon: 'es', lang: 'Español', isFlask: true },
  { key: 'et_EE', icon: 'ee', lang: 'Eesti' },
  { key: 'fi_FI', icon: 'fi', lang: 'Suomalainen', isFlask: true },
  { key: 'fr_FR', icon: 'fr', lang: 'Français' },
  { key: 'he_IL', icon: 'il', lang: 'עברי' },
  { key: 'hi_IN', icon: 'in', lang: 'हिंदी' },
  { key: 'hu_HU', icon: 'hu', lang: 'Magyar', isFlask: true },
  { key: 'id_ID', icon: 'id', lang: 'Bahasa Indonesia' },
  { key: 'it_IT', icon: 'it', lang: 'Italiano' },
  { key: 'ja_JP', icon: 'jp', lang: '日本の' },
  { key: 'lt_LT', icon: 'lt', lang: 'Lietuviešu', isFlask: true },
  { key: 'lv_LV', icon: 'lv', lang: 'Latvijas', isFlask: true },
  { key: 'my_MM', icon: 'mm', lang: 'ျမန္မာ', isFlask: true },
  { key: 'nl_NL', icon: 'nl', lang: 'Nederlands' },
  { key: 'no_NO', icon: 'no', lang: 'Norsk' },
  { key: 'pl_PL', icon: 'pl', lang: 'Język Polski' },
  { key: 'pt_PT', icon: 'pt', lang: 'Português', isFlask: true },
  { key: 'pt_BR', icon: 'br', lang: 'Português (Brasil)' },
  { key: 'ro_RO', icon: 'ro', lang: 'Românesc' },
  { key: 'ru_RU', icon: 'ru', lang: 'Pусский', isFlask: true },
  { key: 'sv_SE', icon: 'se', lang: 'Svenska' },
  { key: 'tr_TR', icon: 'tr', lang: 'Türkçe' },
  { key: 'ur_PK', icon: 'pk', lang: 'اردو' },
  { key: 'zh_CN', icon: 'cn', lang: '中国' },
  { key: 'zh_HK', icon: 'hk', lang: '繁體中文' }
]
