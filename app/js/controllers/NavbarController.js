angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  '$rootScope',
  'AdministrationService', 'ConfigurationService',
  function ($scope, $rootScope, administrationService, configurationService) {
    'use strict'

    $scope.version = ''

    administrationService.getApplicationVersion().then(function (version) {
      if (version) {
        $scope.version = 'v' + version
      }
    }).catch(function (err) {
      console.log(err)
    })

    $rootScope.applicationName = 'OWASP Juice Shop'
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config.application) {
        $rootScope.applicationName = config.application.name
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
