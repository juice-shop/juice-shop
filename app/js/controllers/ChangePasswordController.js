angular.module('myApp').controller('ChangePasswordController', [
    '$scope',
    '$location',
    'UserService',
    function ($scope, $location, userService) {
        'use strict';

        $scope.changePassword = function () {
            userService.changePassword({current: $scope.currentPassword, new: $scope.newPassword, repeat: $scope.newPasswordRepeat}).success(function () {
                $scope.newPassword = undefined;
                $scope.newPasswordRepeat = undefined;
                $location.path( '/' );
            }).error(function(error) {
                $scope.error = error;
            });
        };

    }]);