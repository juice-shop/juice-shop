angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  '$rootScope',
  'AdministrationService',
  'ConfigurationService',
  'UserService',
  function ($scope, $rootScope, administrationService, configurationService, userService) {
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
    $rootScope.gitHubRibbon = 'orange'
    $rootScope.userEmail = ''
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.name !== null) {
        $rootScope.applicationName = config.application.name
      }
      if (config && config.application && config.application.gitHubRibbon !== null) {
        $rootScope.gitHubRibbon = config.application.gitHubRibbon !== 'none' ? config.application.gitHubRibbon : null
      }
      // TODO Remove backward-compatibility of `showGitHubRibbon` config property in v7.0.0
      if (config && config.application && config.application.showGitHubRibbon === false) {
        console.log('Configuration property "application.showGitHubRibbon" is deprecated. Please use "application.gitHubRibbon" instead. See https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/customization.html#yaml-configuration-file')
        $rootScope.gitHubRibbon = 'none'
      }
    }).catch(function (err) {
      console.log(err)
    })

    updateUserEmail()

    $rootScope.$on('user_logged_in', function () {
      updateUserEmail()
    })

    $rootScope.$on('user_logged_out', function () {
      $rootScope.userEmail = ''
    })

    function updateUserEmail () {
      userService.whoAmI().then(function (user) {
        $rootScope.userEmail = user.email
      }).catch(function (err) {
        console.log(err)
      })
    }
  }])
