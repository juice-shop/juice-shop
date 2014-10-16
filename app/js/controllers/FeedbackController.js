angular.module('myApp').controller('FeedbackController', [
    '$scope',
    '$sce',
    'FeedbackService',
    function ($scope, $sce, feedbackService) {
        'use strict';

        function findAll() {
            feedbackService.find().success(function (feedbacks) {
                $scope.feedbacks = feedbacks.data;
                for (var i=0; i<$scope.feedbacks.length; i++) {
                    $scope.feedbacks[i].comment = $sce.trustAsHtml($scope.feedbacks[i].comment);
                }
            }).error(function (err) {
                console.log(err);
            });
        }
        findAll();

        $scope.delete = function (id) {

            feedbackService.del(id).success(function () {
                findAll();
            }).error(function (err) {
                console.log(err);
            });

        };

    }]);