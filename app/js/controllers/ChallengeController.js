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

    $scope.toggleDifficulty = function () {
      $window.localStorage.scoreBoardTablesExpanded = JSON.stringify($scope.scoreBoardTablesExpanded)
    }

    configurationService.getApplicationConfiguration().then(function (data) {
      $scope.allowRepeatNotifications = data.application.showChallengeSolvedNotifications && data.application.showCtfFlagsInNotifications
      $scope.showChallengeHints = data.application.showChallengeHints
    })

    $scope.repeatNotification = function (challenge) {
      if ($scope.allowRepeatNotifications) {
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

    $scope.getOffset = function (challenges, difficulty) {
      var solved = $scope.challenges.filter(function (challenge) { return challenge.difficulty === difficulty && challenge.solved }).length
      var total = $scope.challenges.filter(function (challenge) { return challenge.difficulty === difficulty }).length
      var offset = Math.round(solved * 100 / total)
      offset = 100 - offset
      if (offset === 0) {
        challenges[difficulty].levelComplete = true
      }
      offset = +offset + '%'
      return offset
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
      }
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
  }])
