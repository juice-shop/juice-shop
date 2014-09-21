angular.module('myApp').controller('UserController', [
    '$scope',
    'UserService',
    '$modal',
    function ($scope, userService, $modal) {
        'use strict';

        $scope.showDetail = function (id) {

            var userDetailController = function ($scope) {

                userService.get(id).success(function (data) {
                    $scope.user = data.data;
                }).error(function (data) {
                    console.log(data);
                });
            };

            $modal.open({
                templateUrl: 'views/UserDetail.html',
                controller: userDetailController,
                size: 'lg'
            });
        };

        userService.find().success(function (data) {
            $scope.users = data.data;
        }).error(function (data) {
            console.log(data);
        });

    }]);