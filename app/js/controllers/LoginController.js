angular.module('myApp').controller('LoginController', [
    '$scope',
    '$window',
    'UserService',
    function ($scope, $window, userService) {
        'use strict';

        $scope.login = function () {
            userService.login($scope.user).success(function (data) {
                $window.sessionStorage.token = data.token;
                $scope.message = 'Welcome ' + $scope.user.email;
            }).error(function(error) {
                delete $window.sessionStorage.token;
                $scope.message = error;
            });
        };


    }]);