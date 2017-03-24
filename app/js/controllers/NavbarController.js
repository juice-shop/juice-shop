angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  'AdministrationService', 'ConfigurationService',
  function ($scope, administrationService, configurationService) {
    'use strict'

    $scope.version = ''

    administrationService.getApplicationVersion().success(function (data) {
      if (data && data.version) {
        $scope.version = 'v' + data.version
      }
    }).error(function (err) {
      console.log(err)
    })

    $scope.applicationName = 'OWASP Juice Shop'
    $scope.applicationTheme = 'slate'
    configurationService.getApplicationConfiguration().success(function (data) {
      if (data && data.application) {
        $scope.applicationName = data.application.name
        $scope.applicationTheme = data.application.theme
      }
    }).error(function (err) {
      console.log(err)
    })
  }])
