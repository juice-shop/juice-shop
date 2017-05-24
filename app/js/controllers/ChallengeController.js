angular.module('juiceShop').controller('ChallengeController', [
  '$scope',
  '$sce',
  '$translate',
  '$cookies',
  '$uibModal',
  '$window',
  'ChallengeService',
  'ConfigurationService',
  'socket',
  function ($scope, $sce, $translate, $cookies, $uibModal, $window, challengeService, configurationService, socket) {
    'use strict'

    configurationService.getApplicationConfiguration().then(function (data) {
      $scope.showCtfFlagsInNotifications = data.application.showCtfFlagsInNotifications
      $scope.showChallengeHints = data.application.showChallengeHints
    })

    $scope.repeatNotification = function (challenge) {
      if ($scope.showCtfFlagsInNotifications) {
        challengeService.repeatNotification(encodeURIComponent(challenge.name)).success(function () {
          $window.scrollTo(0, 0)
        })
      }
    }

    $scope.openHint = function (challenge) {
      if ($scope.showChallengeHints && challenge.hintUrl) {
        $window.open(challenge.hintUrl, '_blank')
      }
    }

    $scope.saveProgress = function () {
      $scope.savedContinueCode = $scope.currentContinueCode
      $scope.error = undefined
      $scope.form.$setPristine()

      var expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 30)
      $cookies.put('continueCode', $scope.savedContinueCode, { expires: expireDate })
    }

    $scope.restoreProgress = function () {
      challengeService.restoreProgress(encodeURIComponent($scope.savedContinueCode)).then(function () {
        $cookies.remove('continueCode')
        $scope.savedContinueCode = undefined
        $scope.error = undefined
        $scope.form.$setPristine()
      }).catch(function (error) {
        console.log(error)
        $translate('INVALID_CONTINUE_CODE').then(function (invalidContinueCode) {
          $scope.error = invalidContinueCode
        }, function (translationId) {
          $scope.error = translationId
        })
        $scope.form.$setPristine()
      })
    }

    $scope.trustDescriptionHtml = function () {
      for (var i = 0; i < $scope.challenges.length; i++) {
        $scope.challenges[i].description = $sce.trustAsHtml($scope.challenges[i].description)
      }
    }

    $scope.calculateProgressPercentage = function () {
      var solvedChallenges = 0
      for (var i = 0; i < $scope.challenges.length; i++) {
        solvedChallenges += ($scope.challenges[i].solved) ? 1 : 0
      }
      $scope.percentChallengesSolved = (100 * solvedChallenges / $scope.challenges.length).toFixed(0)
      if ($scope.percentChallengesSolved > 75) {
        $scope.completionColor = 'success'
      } else if ($scope.percentChallengesSolved > 25) {
        $scope.completionColor = 'warning'
      } else {
        $scope.completionColor = 'danger'
      }
    }

    challengeService.find().then(function (challenges) {
      $scope.challenges = challenges
      $scope.trustDescriptionHtml()
      $scope.calculateProgressPercentage()
    }).catch(function (err) {
      console.log(err)
    })

    socket.on('challenge solved', function (data) {
      if (data && data.challenge) {
        for (var i = 0; i < $scope.challenges.length; i++) {
          if ($scope.challenges[i].name === data.name) {
            $scope.challenges[i].solved = true
            break
          }
        }
        $scope.calculateProgressPercentage()
      }
    })

    challengeService.continueCode().then(function (continueCode) {
      $scope.currentContinueCode = continueCode
    }).catch(function (err) {
      console.log(err)
    })
    $scope.savedContinueCode = $cookies.get('continueCode')
  }])
