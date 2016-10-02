angular.module('juiceShop').controller('ChallengeController', [
  '$scope',
  '$sce',
  '$translate',
  'ChallengeService',
  function ($scope, $sce, $translate, challengeService) {
    'use strict'

    $scope.continueCollapsed = true

    $scope.restoreProgress = function () {
      challengeService.restoreProgress(encodeURIComponent($scope.continueCode)).success(function () {
        $scope.continueCode = undefined
        $scope.error = undefined
        $scope.form.$setPristine()
        $scope.continueCollapsed = true
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
      if ($scope.percentChallengesSolved > 66) {
        $scope.completionColor = 'success'
      } else if ($scope.percentChallengesSolved > 33) {
        $scope.completionColor = 'warning'
      } else {
        $scope.completionColor = 'danger'
      }
    }).error(function (data) {
      console.log(data)
    })

    challengeService.continueCode().success(function (continueCode) {
      $scope.currentContinueCode = continueCode
    }).error(function (data) {
      console.log(data)
    })
  }])
