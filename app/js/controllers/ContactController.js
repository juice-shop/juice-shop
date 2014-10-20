angular.module('myApp').controller('ContactController', [
    '$scope',
    'FeedbackService',
    'UserService',
    function ($scope, feedbackService, userService) {
        'use strict';

        userService.whoAmI().success(function(data) {
            $scope.feedback = {};
            $scope.feedback.UserId = data.id;
        });

        $scope.save = function () {
            feedbackService.save($scope.feedback).success(function () {
                $scope.confirmation = 'Thank you for your feedback' + ($scope.feedback.rating === 5 ? ' and your 5-star rating!' : '.');
                $scope.feedback = {};
                $scope.form.$setPristine();
            });
        };

    }]);