angular.module('myApp').controller('NavbarController', [
    '$scope',
    '$window',
    function ($scope, $window) {
        'use strict';

        $scope.isLoggedIn = function () {
            return $window.sessionStorage.token;
        };


    }]);