angular.module('juiceShop').controller('LanguageController', [
  '$scope',
  '$translate',
  function ($scope, $translate) {
    'use strict'
    $scope.changeLanguage = function (langKey) {
      $translate.use(langKey)
    }
  }])
