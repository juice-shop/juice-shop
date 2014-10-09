angular.module('myApp').controller('ContactController', [
    '$scope',
    'FeedbackService',
    function ($scope, feedbackService) {
        'use strict';

        $scope.save = function () {
            feedbackService.save($scope.feedback).success(function () {
                $scope.confirmation = 'Thank you for your feedback ' + ($scope.feedback.rating === 5 ? 'and your 5-star rating!' : '.');
                $scope.feedback = {};
                $scope.form.$setPristine();
            });
        };

    }]);