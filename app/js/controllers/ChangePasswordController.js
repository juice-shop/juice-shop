angular.module('myApp').controller('ChangePasswordController', [
    '$scope',
    '$location',
    'UserService',
    function ($scope, $location, userService) {
        'use strict';

        $scope.changePassword = function () {
            userService.changePassword({current: $scope.currentPassword, new: $scope.newPassword, repeat: $scope.newPasswordRepeat}).success(function () {
                $scope.currentPassword = undefined;
                $scope.newPassword = undefined;
                $scope.newPasswordRepeat = undefined;
                $scope.error = undefined;
                $scope.confirmation = 'Your password was successfully changed.';
                $scope.form.$setPristine();
            }).error(function(error) {
                $scope.error = error;
            });
        };

    }]);