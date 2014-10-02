angular.module('myApp').controller('ChallengeController', [
    '$scope',
    '$sce',
    'ChallengeService',
    function ($scope, $sce, challengeService) {
        'use strict';

        challengeService.find().success(function (data) {
            $scope.challenges = data.data;
            for (var i=0; i<$scope.challenges.length; i++) {
                $scope.challenges[i].description = $sce.trustAsHtml($scope.challenges[i].description);
            }
        }).error(function (data) {
            console.log(data);
        });

    }]);