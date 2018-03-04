angular.module('juiceShop').controller('LanguageController', [
  '$scope',
  '$translate',
  function ($scope, $translate) {
    'use strict'

    $scope.languages = languages
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey)
    }
  }])

var languages = [
  {key: 'ar_SA', lang: 'عربى', isFlask: true},
  {key: 'cs_CZ', lang: 'Česky'},
  {key: 'da_DK', lang: 'Dansk', isFlask: true},
  {key: 'de_DE', lang: 'Deutsch'},
  {key: 'el_GR', lang: 'Ελληνικά', isFlask: true},
  {key: 'es_ES', lang: 'Español'},
  {key: 'et_EE', lang: 'Eesti', isFlask: true},
  {key: 'fi_FI', lang: 'Suomalainen', isFlask: true},
  {key: 'fr_FR', lang: 'Français'},
  {key: 'he_IL', lang: 'עברי'},
  {key: 'hu_HU', lang: 'Magyar', isFlask: true},
  {key: 'id_ID', lang: 'Bahasa Indonesia'},
  {key: 'it_IT', lang: 'Italiano', isFlask: true},
  {key: 'ja_JP', lang: '日本の'},
  {key: 'lt_LT', lang: 'Lietuviešu', isFlask: true},
  {key: 'lv_LV', lang: 'Latvijas', isFlask: true},
  {key: 'my_MM', lang: 'ျမန္မာ'},
  {key: 'nl_NL', lang: 'Nederlands'},
  {key: 'no_NO', lang: 'Norsk'},
  {key: 'pl_PL', lang: 'Język Polski'},
  {key: 'pt_PT', lang: 'Português'},
  {key: 'ro_RO', lang: 'Românesc'},
  {key: 'ru_RU', lang: 'Pусский'},
  {key: 'sv_SE', lang: 'Svenska'},
  {key: 'tr_TR', lang: 'Türkçe'},
  {key: 'ur_PK', lang: 'اردو'},
  {key: 'zh_CN', lang: '中国'},
  {key: 'zh_HK', lang: '繁體中文', isFlask: true}
]
