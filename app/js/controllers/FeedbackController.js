angular.module('myApp').controller('FeedbackController', [
    '$scope',
    '$sce',
    'FeedbackService',
    function ($scope, $sce, feedbackService) {
        'use strict';

        function findAll() {
            feedbackService.find().success(function (data) {
                $scope.feedbacks = data.data;
                for (var i=0; i<$scope.feedbacks.length; i++) {
                    $scope.feedbacks[i].comment = $sce.trustAsHtml($scope.feedbacks[i].comment);
                }
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