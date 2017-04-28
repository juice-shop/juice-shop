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

    configurationService.getApplicationConfiguration().then(function (config) {
      $rootScope.applicationName = (config && config.application && config.application.name !== null) ? config.application.name : 'OWASP Juice Shop'
      $rootScope.showGitHubRibbon = (config && config.application && config.application.showGitHubRibbon !== null) ? config.application.showGitHubRibbon : true
    }).catch(function (err) {
      console.log(err)
    })
  }])
