angular.module('myApp').controller('ChallengeController', [
    '$scope',
    '$sce',
    'ChallengeService',
    function ($scope, $sce, challengeService) {
        'use strict';

        challengeService.find().success(function (challenges) {
            $scope.challenges = challenges.data;
            var solvedChallenges = 0;
            for (var i=0; i<$scope.challenges.length; i++) {
                $scope.challenges[i].description = $sce.trustAsHtml($scope.challenges[i].description);
                solvedChallenges += ($scope.challenges[i].solved) ? 1 : 0;
            }
            $scope.percentChallengesSolved = (100 * solvedChallenges / $scope.challenges.length).toFixed(0);
            if ($scope.percentChallengesSolved === 100) {
                $scope.completionColor = '#4c1'; // brightgreen
            } else if ($scope.percentChallengesSolved > 80) {
                $scope.completionColor = '#97ca00'; // green
            } else if ($scope.percentChallengesSolved > 60) {
                $scope.completionColor = '#a4a61d'; // yellowgreen
            } else if ($scope.percentChallengesSolved > 40) {
                $scope.completionColor = '#dfb317'; // yellow
            } else if ($scope.percentChallengesSolved > 20) {
                $scope.completionColor = '#fe7d37'; // orange
            } else {
                $scope.completionColor = '#e05d44'; // red
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);