angular.module('myApp').controller('FeedbackController', [
    '$scope',
    'FeedbackService',
    function ($scope, feedbackService) {
        'use strict';

        $scope.delete = function (id) {

            feedbackService.del(id).success(function (data) {
            }).error(function (data) {
                console.log(data);
            });

        };

        feedbackService.find().success(function (data) {
            $scope.feedbacks = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);