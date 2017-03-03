angular.module('juiceShop').controller('ChallengeController', [
  '$scope',
  '$sce',
  '$translate',
  '$cookies',
  '$uibModal',
  'ChallengeService',
  function ($scope, $sce, $translate, $cookies, $uibModal, challengeService) {
    'use strict'

    $scope.repeatNotification = function (challenge) {
      challengeService.repeatNotification(encodeURIComponent(challenge.name));
    };

    $scope.saveProgress = function () {
      $scope.savedContinueCode = $scope.currentContinueCode
      $scope.error = undefined
      $scope.form.$setPristine()

      var expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 30)
      $cookies.put('continueCode', $scope.savedContinueCode, { expires: expireDate })
    }

    $scope.restoreProgress = function () {
      challengeService.restoreProgress(encodeURIComponent($scope.savedContinueCode)).success(function () {
        $cookies.remove('continueCode')
        $scope.savedContinueCode = undefined
        $scope.error = undefined
        $scope.form.$setPristine()
      }).error(function (error) {
        console.log(error)
        $translate('INVALID_CONTINUE_CODE').then(function (invalidContinueCode) {
          $scope.error = invalidContinueCode
        }, function (translationId) {
          $scope.error = translationId
        })
        $scope.form.$setPristine()
      })
    }

    challengeService.find().success(function (challenges) {
      $scope.challenges = challenges.data
      var solvedChallenges = 0
      for (var i = 0; i < $scope.challenges.length; i++) {
        $scope.challenges[i].description = $sce.trustAsHtml($scope.challenges[i].description)
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
    }).error(function (data) {
      console.log(data)
    })

    challengeService.continueCode().success(function (data) {
      $scope.currentContinueCode = data.continueCode
    }).error(function (data) {
      console.log(data)
    })
    $scope.savedContinueCode = $cookies.get('continueCode')
  }])
