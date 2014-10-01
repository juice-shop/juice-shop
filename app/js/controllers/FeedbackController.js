angular.module('myApp').controller('FeedbackController', [
    '$scope',
    '$sce',
    'FeedbackService',
    function ($scope, $sce, feedbackService) {
        'use strict';

        function findAll() {
            feedbackService.find().success(function (data) {
                $scope.challenges = data.data;
                for (var i=0; i<$scope.challenges.length; i++) {
                    $scope.challenges[i].comment = $sce.trustAsHtml($scope.challenges[i].comment);
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

    }]);