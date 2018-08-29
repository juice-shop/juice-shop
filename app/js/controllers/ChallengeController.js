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

    $scope.scoreBoardTablesExpanded = $window.localStorage.scoreBoardTablesExpanded ? JSON.parse($window.localStorage.scoreBoardTablesExpanded) : [null, true, false, false, false, false, false]
    $scope.offsetValue = ['100%', '100%', '100%', '100%', '100%', '100%']

    $scope.toggleDifficulty = function () {
      $window.localStorage.scoreBoardTablesExpanded = JSON.stringify($scope.scoreBoardTablesExpanded)
    }

    configurationService.getApplicationConfiguration().then(function (data) {
      $scope.allowRepeatNotifications = data.application.showChallengeSolvedNotifications && data.ctf.showFlagsInNotifications
      $scope.showChallengeHints = data.application.showChallengeHints
    }).catch(angular.noop)

    $scope.repeatNotification = function (challenge) {
      if ($scope.allowRepeatNotifications) {
        challengeService.repeatNotification(encodeURIComponent(challenge.name)).then(function () {
          $window.scrollTo(0, 0)
        }).catch(angular.noop)
      }
    }

    $scope.openHint = function (challenge) {
      if ($scope.showChallengeHints && challenge.hintUrl) {
        $window.open(challenge.hintUrl, '_blank')
      }
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

    $scope.setOffset = function (challenges) {
      for (var difficulty = 1; difficulty <= 6; difficulty++) {
        var solved = 0
        var total = 0

        for (var i = 0; i < challenges.length; i++) {
          if (challenges[i].difficulty === difficulty) {
            total++
            if (challenges[i].solved) {
              solved++
            }
          }
        }

        var offset = Math.round(solved * 100 / total)
        offset = 100 - offset
        offset = +offset + '%'
        $scope.offsetValue[difficulty - 1] = offset
      }
    }

    challengeService.find().then(function (challenges) {
      $scope.challenges = challenges
      for (var i = 0; i < $scope.challenges.length; i++) {
        if ($scope.challenges[i].hintUrl) {
          if ($scope.challenges[i].hint) {
            $scope.challenges[i].hint += ' Click for more hints.'
          } else {
            $scope.challenges[i].hint = 'Click to open hints.'
          }
        }
        if ($scope.challenges[i].disabledEnv) {
          $scope.challenges[i].hint = 'This challenge is unavailable in a ' + $scope.challenges[i].disabledEnv + ' environment!'
        }
      }
      $scope.trustDescriptionHtml()
      $scope.calculateProgressPercentage()
      $scope.setOffset(challenges)
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
        $scope.setOffset($scope.challenges)
      }
    })
  }])
