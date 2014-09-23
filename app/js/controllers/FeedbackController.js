angular.module('myApp').controller('FeedbackController', [
    '$scope',
    'FeedbackService',
    function ($scope, feedbackService) {
        'use strict';

        function findAll() {
            feedbackService.find().success(function (data) {
                $scope.feedbacks = data.data;
            }).error(function (data) {
                console.log(data);
            });
        }
        findAll();

        $scope.delete = function (id) {

            feedbackService.del(id).success(function () {
                findAll();
            }).error(function (data) {
                console.log(data);
            });

        };

        $scope.save = function () {
            feedbackService.save($scope.feedback).success(function () {
                $scope.feedback = {};
                findAll();
            });
        }

    }]);