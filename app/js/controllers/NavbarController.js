angular.module('juiceShop').controller('NavbarController', [
  '$scope',
  '$rootScope',
  '$location',
  'AdministrationService',
  'ConfigurationService',
  'UserService',
  'ChallengeService',
  function ($scope, $rootScope, $location, administrationService, configurationService, userService, challengeService) {
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
    configurationService.getApplicationConfiguration().then(function (config) {
      if (config && config.application && config.application.name !== null) {
        $rootScope.applicationName = config.application.name
      }
      if (config && config.application && config.application.gitHubRibbon !== null) {
        $rootScope.gitHubRibbon = config.application.gitHubRibbon !== 'none' ? config.application.gitHubRibbon : null
      }
    }).catch(function (err) {
      console.log(err)
    })

    if ($location.search().gitHubRibbon) {
      $rootScope.gitHubRibbon = $location.search().gitHubRibbon
    }

    $rootScope.userEmail = ''
    updateUserEmail()
    $rootScope.$on('user_logged_in', function () {
      updateUserEmail()
    })
    $rootScope.$on('user_logged_out', function () {
      $rootScope.userEmail = ''
    })

    $rootScope.scoreBoardMenuVisible = false
    setScoreBoardMenuVisibility()
    $rootScope.$on('score_board_challenge_solved', function () {
      $rootScope.scoreBoardMenuVisible = true
    })

    function updateUserEmail () {
      userService.whoAmI().then(function (user) {
        $rootScope.userEmail = user.email
      }).catch(function (err) {
        console.log(err)
      })
    }

    function setScoreBoardMenuVisibility () {
      challengeService.find({ name: 'Score Board' }).then(function (challenges) {
        $rootScope.scoreBoardMenuVisible = challenges[0].solved
      }).catch(function (err) {
        console.log(err)
      })
    }
  }])
