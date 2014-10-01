angular.module('myApp').controller('ChallengeController', [
    '$scope',
    'ChallengeService',
    function ($scope, challengeService) {
        'use strict';

        challengeService.find().success(function (data) {
            $scope.challenges = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);