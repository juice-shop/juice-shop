angular.module('myApp').controller('LoginController', [
    '$scope',
    '$window',
    '$location',
    '$cookieStore',
    'UserService',
    function ($scope, $window, $location, $cookieStore, userService) {
        'use strict';

        $scope.login = function () {
            userService.login($scope.user).success(function (data) {
                $cookieStore.put('token', data.token);
                $window.sessionStorage.bid = data.bid;
                $location.path( '/' );
            }).error(function(error) {
                $cookieStore.remove('token');
                delete $window.sessionStorage.bid;
                $scope.error = error;
                $scope.form.$setPristine();
                // TODO If status code !=401 then solve(errorHandlingChallenge)
            });
        };

    }]);