angular.module('myApp').controller('LoginController', [
    '$scope',
    'UserService',
    function ($scope, userService) {
        'use strict';

        $scope.login = function () {
            userService.login($scope.user).success(function (data) {
                // TODO remove dummy implementation
                if (data && data.data && data.data.id) {
                    alert('Logged in!');
                } else {
                    alert('Wrong credentials!');
                }
            });
        };


    }]);