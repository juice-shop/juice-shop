angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  '$rootScope',
  'AdministrationService', 'ConfigurationService',
  function ($scope, $rootScope, administrationService, configurationService) {
    'use strict'

    $scope.version = ''

    administrationService.getApplicationVersion().success(function (data) {
      if (data && data.version) {
        $scope.version = 'v' + data.version
      }
    }).error(function (err) {
      console.log(err)
    })

    $rootScope.applicationName = 'OWASP Juice Shop'
    $rootScope.applicationTheme = 'slate'
    configurationService.getApplicationConfiguration().success(function (data) {
      if (data && data.application) {
        $rootScope.applicationName = data.application.name
        $rootScope.applicationTheme = data.application.theme
      }
    }).error(function (err) {
      console.log(err)
    })
  }])
