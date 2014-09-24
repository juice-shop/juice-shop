angular.module('myApp').controller('RegisterController', [
    '$scope',
    '$location',
    'UserService',
    function ($scope, $location, userService) {
        'use strict';

        $scope.save = function () {
            $scope.user.admin = false;
            userService.save($scope.user).success(function () {
                $scope.user = {};
                $location.path( "/login" );
            });
        }

    }]);