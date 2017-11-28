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
    $rootScope.showGitHubRibbon = true
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.name !== null) {
        $rootScope.applicationName = config.application.name
      }
      if (config && config.application && config.application.showGitHubRibbon !== null) {
        $rootScope.showGitHubRibbon = config.application.showGitHubRibbon
      }
    }).catch(function (err) {
      console.log(err)
    })
  }])
