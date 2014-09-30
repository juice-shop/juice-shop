angular.module('myApp').controller('LogoutController', [
    '$window',
    '$location',
    function ($window, $location) {
        'use strict';

        delete $window.sessionStorage.token;
        $location.path( '/' );

    }]);