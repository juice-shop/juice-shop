angular.module('myApp').controller('LoginController', [
    '$scope',
    '$window',
    '$location',
    'UserService',
    function ($scope, $window, $location, userService) {
        'use strict';

        $scope.login = function () {
            userService.login($scope.user).success(function (data) {
                $window.sessionStorage.token = data.token;
                $location.path( '/' );
            }).error(function(error) {
                delete $window.sessionStorage.token;
                $scope.error = error;
            });
        };

    }]);