angular.module('myApp').controller('ContactController', [
    '$scope',
    'FeedbackService',
    function ($scope, feedbackService) {
        'use strict';

        $scope.save = function () {
            feedbackService.save($scope.feedback).success(function () {
                $scope.feedback = {};
                $scope.form.$setPristine();
            });
        };

    }]);