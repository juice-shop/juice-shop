angular.module('juiceShop').controller('ChallengeController', [
  '$scope',
  '$sce',
  'ChallengeService',
  function ($scope, $sce, challengeService) {
    'use strict'

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
  }])
